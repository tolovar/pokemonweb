from flask import Flask, request, jsonify, render_template, url_for, Blueprint, redirect
import requests  
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash
from backend.models.users import User
from backend.models.admin import Admin
from backend.models import db

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
app.config['JWT_SECRET_KEY'] = 'super-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://ales:supersecretpassword@localhost:5432/pokemondb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
jwt = JWTManager(app)
db.init_app(app)
app.template_folder = 'templates'

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
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Dati mancanti'}), 400
    user = User.query.filter(
        (User.username == data['username']) | (User.email == data['username'])
    ).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Credenziali errate'}), 401
    access_token = create_access_token(identity=user.id)
    return jsonify({'token': access_token}), 200

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

# gestisco gli errori
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)

