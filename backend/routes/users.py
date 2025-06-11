from flask import Blueprint, request, jsonify
from backend.models.users import User
from backend.models import db
from flask_jwt_extended import jwt_required
from werkzeug.security import generate_password_hash

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
        return jsonify({"success": False, "error": "Username o email già esistenti"}), 409
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
        return jsonify({"success": False, "error": "User not found"}), 404
    # controllo duplicati
    if 'username' in data and data['username'] != user.username:
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"success": False, "error": "Username già esistente"}), 409
        user.username = data['username']
    if 'email' in data and data['email'] != user.email:
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"success": False, "error": "Email già esistente"}), 409
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
        return jsonify({"success": False, "error": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True, "message": "User deleted"})