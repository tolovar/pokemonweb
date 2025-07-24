from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.users import User, UserRegisterSchema
from backend.models import db
from flask_jwt_extended import create_access_token
from flask_mail import Message
import os
import requests
import logging

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")

def send_recovery_mail_mailgun(email, username):
    if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
        logging.warning("credenziali Mailgun non configurate")
        return None
    try:
        return requests.post(
            f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
            auth=("api", MAILGUN_API_KEY),
            data={"from": f"PokemonWeb <mail@{MAILGUN_DOMAIN}>",
                  "to": [email],
                  "subject": "Tentativo di accesso fallito! Recupero account",
                  "text": f"Ciao {username},\n\nAbbiamo rilevato un tentativo di accesso fallito.\nSe hai dimenticato la password, puoi reimpostarla qui: https://PokemonWeb/reset-password?email={email}"}
        )
    except Exception as e:
        logging.error(f"Errore nell'invio dell'email di recupero via Mailgun: {e}")
        return None

@auth_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

# logica per la registrazione 
@auth_bp.route('/register', methods=['POST'])
def register():
    schema = UserRegisterSchema()
    data = request.get_json()
    errors = schema.validate(data)
    if errors:
        return jsonify({"error": "Validation error", "details": errors}), 400
    try:
        if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
            return jsonify({"success": False, "error": "Username o email già esistenti"}), 409
        user = User()
        user.username = data['username']
        user.email = data['email']
        user.password_hash = generate_password_hash(data['password'])
        user.is_admin = data.get('is_admin', False)
        db.session.add(user)
        db.session.commit()
        logging.info(f"New user registered: {data['username']}")
        return jsonify({"success": True, "message": "Utente registrato"}), 201
    except Exception as e:
        logging.error(f"Error in register: {e}")
        return jsonify({"success": False, "error": "Errore interno"}), 500

# logica per il login
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        if not user or not check_password_hash(user.password_hash, data['password']):
            # invio mail di recupero solo se l'utente esiste
            if user:
                send_recovery_mail_mailgun(user.email, user.username)
            return jsonify({'success': False, 'error': 'Credenziali errate.'}), 401    
        # forzo il formato come stringa per evitare problemi con jwt
        # (accetta solo stringhe come identity per il campo "sub")
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_access_token(identity=str(user.id))
        logging.info(f"User logged in: {user.username}")
        return jsonify({'success': True, 'access_token': access_token}), 200
    except Exception as e:
        logging.error(f"Error in login: {e}")
        return jsonify({"success": False, "error": "Errore interno"}), 500

@auth_bp.route('/recover', methods=['POST'])
def recover_password():
    try:
        data = request.get_json()
        email = data.get('email')
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"success": False, "error": "Email non trovata"}), 404

        # invio mail di recupero con Flask-Mail
        try:
            msg = Message("Recupero password PokémonWeb",
                          sender=os.getenv('MAIL_USERNAME'),
                          recipients=[email])
            msg.body = f"Ciao {user.username},\n\nPer reimpostare la tua password visita il link: https://PokemonWeb/reset-password?email={email}"
            current_app.extensions['mail'].send(msg)
            logging.info(f"Recovery email sent to: {email}")
            return jsonify({"success": True, "message": "Email di recupero inviata"}), 200
        except Exception as e:
            logging.error(f"Error sending recovery email: {e}")
            return jsonify({"success": False, "error": "Errore nell'invio dell'email"}), 500
    except Exception as e:
        logging.error(f"Error in recover_password: {e}")
        return jsonify({"success": False, "error": "Errore interno"}), 500