from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.pokemon_team import PokemonTeam
from backend.models import db

pokemon_bp = Blueprint('pokemon', __name__, url_prefix='/api')

@pokemon_bp.route('/team', methods=['GET'])
@jwt_required()
def get_team():
    user_id = get_jwt_identity()
    team = PokemonTeam.query.filter_by(user_id=user_id).all()
    return jsonify([p.to_dict() for p in team])

@pokemon_bp.route('/team', methods=['POST'])
@jwt_required()
def add_pokemon_to_team():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"success": False, "message": "Nome pokémon mancante"}), 400
    existing = PokemonTeam.query.filter_by(user_id=user_id, name=name).first()
    if existing:
        return jsonify({"success": False, "message": "Pokémon già presente in squadra"}), 409
    new_pokemon = PokemonTeam(user_id=user_id, name=name)
    db.session.add(new_pokemon)
    db.session.commit()
    return jsonify({"success": True, "message": "Pokémon aggiunto", "pokemon": {"name": name}}), 201