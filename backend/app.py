from flask import Flask, request, jsonify, render_template, url_for, Blueprint, redirect, session
import requests  
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from backend.models.users import User
from backend.models.admin import Admin
from backend.models import db
from backend.models.pokemon_team import PokemonTeam  
from flask_mail import Mail, Message

app = Flask(__name__)
# fLASK-CORS aggiunge automaticamente gli header CORS
CORS(app, supports_credentials=True)

app.config['JWT_SECRET_KEY'] = 'super-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:supersecretpassword@localhost:5432/pokemondb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# configura Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'mail@mail.com'
app.config['MAIL_PASSWORD'] = 'password'
jwt = JWTManager(app)
db.init_app(app)
app.template_folder = 'templates'
mail = Mail(app)

# blueprint per gli utenti
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin
        } for u in users
    ])

@users_bp.route('/', methods=['POST'])
def create_user():
    data = request.json
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({"error": "Username o email già esistenti"}), 409
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        is_admin=data.get('is_admin', False)
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin}), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.json
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    # controllo duplicati
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"error": "Username già esistente"}), 409
        user.username = data['username']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email già esistente"}), 409
        user.email = data['email']
    if data.get('password'):
        user.password_hash = generate_password_hash(data['password'])
    user.is_admin = data.get('is_admin', user.is_admin)
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin})

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"msg": "User deleted"})

# funzione global per aggiungere gli header CORS
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

# aggiungo gli header CORS per il blueprint degli utenti
@users_bp.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,OPTIONS'
    return response

app.register_blueprint(users_bp)

# resistrazione utente
@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    data = request.json
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({"error": "Username o email già esistenti"}), 409
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        is_admin=data.get('is_admin', False)
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Utente registrato"}), 201

# login utente
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    session.setdefault('failed_attempts', {})
    failed_attempts = session['failed_attempts'].get(username, 0)

    user = User.query.filter(
        (User.username == username) | (User.email == username)
    ).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        if user:
            failed_attempts += 1
            session['failed_attempts'][username] = failed_attempts
            if failed_attempts >= 3:
                send_recovery_mail_mailgun(user.email, user.username)
                # resetto i tentativi falliti dopo l'invio della mail
                session['failed_attempts'][username] = 0  
        return jsonify({'message': 'Credenziali errate.'}), 401
    session['failed_attempts'][username] = 0 
    access_token = create_access_token(identity=user.id)
    return jsonify({'token': access_token}), 200

# uso Mailgun per inviare la mail di recupero
def send_recovery_mail_mailgun(email, username):
    return requests.post(
        "https://api.mailgun.net/v3/tuodominio.mailgun.org/messages",
        # da sostituire con il dominio e mail corretti
        auth=("api", "API_KEY_MAILGUN"),
        data={"from": "PokemonWeb <mail@dominio.mailgun.org>",
              "to": [email],
              "subject": "Tentativo di accesso fallito! Recupero account",
              "text": f"Ciao {username},\n\nAbbiamo rilevato un tentativo di accesso fallito.\nSe hai dimenticato la password, puoi reimpostarla qui: https://PokemonWeb/reset-password?email={email}"}
    )

# blueprint admin
admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

admin_data = []

@admin_bp.route('/data', methods=['GET'])
@jwt_required()
def get_admin_data():
    # filtri e paginazione tramite query string
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify(admin_data[start:end])

@admin_bp.route('/data', methods=['POST'])
@jwt_required()
def create_admin_data():
    data = request.json
    admin_data.append(data)
    return jsonify(data), 201

app.register_blueprint(admin_bp)

# endpoint che restituisce solo la squadra dell'utente che visualizza la pagina
@app.route('/api/team', methods=['GET'])
@jwt_required()
def get_team():
    user_id = get_jwt_identity()
    team = PokemonTeam.query.filter_by(user_id=user_id).all()
    return jsonify([p.to_dict() for p in team])

# endpoint per aggiungere un pokémon alla squadra dell'utente
@app.route('/api/team', methods=['POST'])
@jwt_required()
def add_pokemon_to_team():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"success": False, "message": "Nome pokémon mancante"}), 400
    # controllo che il pokémon non sia già nella squadra
    existing = PokemonTeam.query.filter_by(user_id=user_id, name=name).first()
    if existing:
        return jsonify({"success": False, "message": "Pokémon già presente in squadra"}), 409
    # aggiungo il pokémon
    new_pokemon = PokemonTeam(user_id=user_id, name=name)
    db.session.add(new_pokemon)
    db.session.commit()
    return jsonify({"success": True, "message": "Pokémon aggiunto", "pokemon": {"name": name}}), 201

# recupero password
@app.route('/api/recover', methods=['POST'])
def recover_password():
    data = request.get_json()
    email = data.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "Email non trovata"}), 404

    # genero un token di reset e invio il link
    msg = Message("Recupero password PokémonWeb",
                  sender="tuamail@gmail.com",
                  recipients=[email])
    msg.body = f"Ciao! {user.username},\n\nPer reimpostare la tua password visita il link: https://PokemonWeb/reset-password?email={email}"
    mail.send(msg)
    return jsonify({"message": "Email di recupero inviata"}), 200

# setup del database e avvio dell'applicazione
if __name__ == '__main__':
    with app.app_context():
        # creo tutte le tabelle definite nei modelli
        db.create_all()  
        app.run(debug=True)


# gestisco gli errori

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400

@app.errorhandler(401)
def unauthorized(error):
    return jsonify({"error": "Unauthorized"}), 401

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(409)
def conflict(error):
    return jsonify({"error": "Conflict"}), 409

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500
