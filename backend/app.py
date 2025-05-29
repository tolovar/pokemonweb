from flask import Flask, request, jsonify, render_template, url_for, Blueprint, redirect
import requests  
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'super-secret-key'
# configuro del database PostgreSQL
# ales è l'utente, supersecretpassword è la password, 5432 è la porta locale usata da PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://ales:supersecretpassword@localhost:5432/pokemondb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
jwt = JWTManager(app)
db = SQLAlchemy(app)

# imposto il percorso per i template
app.template_folder = 'templates'

# setto la blueprint per i pokémon
pokemon_bp = Blueprint('pokemon', __name__)
app.register_blueprint(pokemon_bp)

# API default per la home page
@app.route('/home')
def home():
    return render_template('index.html')

# API per la home page che restituisce un redirect
@app.route('/api/redirect')
def redirect_home():
    return jsonify(redirect_url=url_for('home'))

# API su cui si apre il sito con comando 'npm start'
# restituisce un redirect alla home page
@app.route('/api/')
def start():
    return jsonify(redirect_url=url_for('home'))

# API per la schermata Home
@app.route('/home')
def show_home():
    return render_template('home.html')

# API per /pokemon che restituisce la lista dei Pokémon
@app.route('/pokemon')
def show_pokemon():
    return render_template('pokemon.html', pokemons=[])

# API REST che prende i pokémon
# questa API restituisce un JSON con i dati dei Pokémon
@app.route('/api/pokemon', methods=['GET'])
def api_get_pokemons():
    limit = request.args.get('limit', default=18, type=int)
    offset = request.args.get('offset', default=0, type=int)
    response = requests.get(f'https://pokeapi.co/api/v2/pokemon?limit={limit}&offset={offset}')
    if response.status_code == 200:
        data = response.json()
        return jsonify({
            "results": data["results"],
            "next": data.get("next")
        })
    return jsonify({"error": "Impossibile recuperare i dati"}), 500

# Blueprint per la gestione degli utenti
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

# mock database
users_db = []

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    return jsonify(users_db)

# Creazione utente
@users_bp.route('/', methods=['POST'])
def create_user():
    data = request.json
    user = User(email=data['email'], password=data['password'], is_admin=data.get('is_admin', False))
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "email": user.email, "is_admin": user.is_admin}), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.json
    for user in users_db:
        if user['id'] == user_id:
            user.update(data)
            return jsonify(user)
    return jsonify({"error": "User not found"}), 404

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    global users_db
    users_db = [u for u in users_db if u['id'] != user_id]
    return jsonify({"msg": "User deleted"})

# Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if not user:
        return jsonify({"msg": "Queste credenziali sono errate"}), 401
    access_token = create_access_token(identity=user.email, expires_delta=datetime.timedelta(hours=1))
    return jsonify(access_token=access_token)

app.register_blueprint(users_bp)

# blueprint per la gestione admin
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

# gestisco gli errori
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404
@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)