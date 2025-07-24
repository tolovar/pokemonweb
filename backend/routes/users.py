from flask import Blueprint, request, jsonify
from backend.models.users import User
from backend.models import db
from flask_jwt_extended import jwt_required
from werkzeug.security import generate_password_hash
import logging
from marshmallow import Schema, fields, validate

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

class UserRegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=32))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

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
    data = request.get_json()
    if not data or not all(k in data for k in ('username', 'email', 'password')):
        return jsonify({"success": False, "error": "Campi obbligatori mancanti"}), 400
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return jsonify({"success": False, "error": "Username o email già esistenti"}), 409
    user = User()
    user.username = data['username']
    user.email = data['email']
    user.password_hash = generate_password_hash(data['password'])
    user.is_admin = data.get('is_admin', False)
    db.session.add(user)
    db.session.commit()
    logging.info(f"Creato nuovo utente: {user.username}")
    return jsonify({"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin}), 201

@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Dati mancanti"}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "Utente non trovato"}), 404
    # controllo duplicati
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"success": False, "error": "Username già esistente"}), 409
        user.username = data['username']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"success": False, "error": "Email già esistente"}), 409
        user.email = data['email']
    if 'password' in data and data['password']:
        user.password_hash = generate_password_hash(data['password'])
    user.is_admin = data.get('is_admin', user.is_admin)
    db.session.commit()
    logging.info(f"Aggiornato utente: {user.username}")
    return jsonify({"id": user.id, "username": user.username, "email": user.email, "is_admin": user.is_admin})

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"success": False, "error": "Utente non trovato"}), 404
    db.session.delete(user)
    db.session.commit()
    logging.info(f"Eliminato utente: {user.username}")
    return jsonify({"success": True, "message": "Utente eliminato"})