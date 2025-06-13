from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.users import User
from backend.models import db
from flask_jwt_extended import create_access_token
from flask_mail import Message
import os
import requests

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN")

def send_recovery_mail_mailgun(email, username):
    if not MAILGUN_API_KEY or not MAILGUN_DOMAIN:
        return None
    return requests.post(
        f"https://api.mailgun.net/v3/{MAILGUN_DOMAIN}/messages",
        auth=("api", MAILGUN_API_KEY),
        data={"from": f"PokemonWeb <mail@{MAILGUN_DOMAIN}>",
              "to": [email],
              "subject": "Tentativo di accesso fallito! Recupero account",
              "text": f"Ciao {username},\n\nAbbiamo rilevato un tentativo di accesso fallito.\nSe hai dimenticato la password, puoi reimpostarla qui: https://PokemonWeb/reset-password?email={email}"}
    )

@auth_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

# logica per la registrazione 
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({"success": False, "error": "Username o email già esistenti"}), 409
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        is_admin=data.get('is_admin', False)
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"success": True, "message": "Utente registrato"}), 201

# logica per il login
@auth_bp.route('/login', methods=['POST'])
def login():
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
    return jsonify({'success': True, 'access_token': access_token}), 200

@auth_bp.route('/recover', methods=['POST'])
def recover_password():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"success": False, "error": "Email non trovata"}), 404

    # invio mail di recupero con Flask-Mail
    msg = Message("Recupero password PokémonWeb",
                  sender=os.getenv('MAIL_USERNAME'),
                  recipients=[email])
    msg.body = f"Ciao {user.username},\n\nPer reimpostare la tua password visita il link: https://PokemonWeb/reset-password?email={email}"
    from app import mail
    mail.send(msg)
    return jsonify({"success": True, "message": "Email di recupero inviata"}), 200