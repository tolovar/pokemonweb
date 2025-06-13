from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models import TeamPokemon
from app import db

team_bp = Blueprint('team', __name__, url_prefix='/api')

class TeamPokemon(db.Model):
    __tablename__ = 'team_pokemon'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name
        }

# recupero la squadra 
@team_bp.route('/team', methods=['GET'])
@jwt_required()
def get_team():
    try:
        user_id = get_jwt_identity()
        print("user_id:", user_id)  # log per debug

        # query per recuperare la squadra
        team = TeamPokemon.query.filter_by(user_id=user_id).all()
        team_serialized = [pokemon.to_dict() for pokemon in team]

        return jsonify(team_serialized), 200
    except Exception as e:
        import traceback
        print("Errore in get_team:", e)
        print(traceback.format_exc())
        return jsonify({"success": False, "error": "Errore interno"}), 500

# aggiungo un pokémon alla squadra 
@team_bp.route('/team', methods=['POST'])
@jwt_required()
def add_to_team():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        print("user_id:", user_id, "data:", data)  # log per debug

        # validazione input
        if not data or 'name' not in data or not isinstance(data['name'], str):
            return jsonify({"success": False, "error": "Nome Pokémon mancante o non valido"}), 400

        pokemon_name = data['name'].strip().lower()
        if not pokemon_name:
            return jsonify({"success": False, "error": "Nome Pokémon vuoto"}), 400

        # limite squadra 
        team_count = TeamPokemon.query.filter_by(user_id=user_id).count()
        if team_count >= 6:
            return jsonify({"success": False, "error": "La squadra può contenere al massimo 6 Pokémon"}), 400

        # evito duplicati
        exists = TeamPokemon.query.filter_by(user_id=user_id, name=pokemon_name).first()
        if exists:
            return jsonify({"success": False, "error": "Questo Pokémon è già nella tua squadra"}), 400

        # salvo sul db
        new_pokemon = TeamPokemon(user_id=user_id, name=pokemon_name)
        db.session.add(new_pokemon)
        db.session.commit()

        print(f"Aggiunto {pokemon_name} alla squadra di {user_id}")

        return jsonify({"success": True, "message": f"Pokémon '{pokemon_name}' aggiunto"}), 201

    except Exception as e:
        import traceback
        print("Errore in add_to_team:", e)
        print(traceback.format_exc())
        return jsonify({"success": False, "error": "Errore interno"}), 500

# rimuovo un pokémon dalla squadra 
@team_bp.route('/team/<int:pokemon_id>', methods=['DELETE'])
@jwt_required()
def remove_from_team(pokemon_id):
    try:
        user_id = get_jwt_identity()
        pokemon = TeamPokemon.query.filter_by(id=pokemon_id, user_id=user_id).first()
        if not pokemon:
            return jsonify({"success": False, "error": "Pokémon non trovato nella tua squadra"}), 404

        db.session.delete(pokemon)
        db.session.commit()
        print(f"Rimosso Pokémon id={pokemon_id} dalla squadra di {user_id}")

        return jsonify({"success": True, "message": "Pokémon rimosso dalla squadra"}), 200
    except Exception as e:
        import traceback
        print("Errore in remove_from_team:", e)
        print(traceback.format_exc())
        return jsonify({"success": False, "error": "Errore interno"}), 500

# svuoto la squadra 
@team_bp.route('/team', methods=['DELETE'])
@jwt_required()
def clear_team():
    try:
        user_id = get_jwt_identity()
        deleted = TeamPokemon.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        print(f"Svuotata la squadra di {user_id} ({deleted} Pokémon rimossi)")
        return jsonify({"success": True, "message": "Squadra svuotata"}), 200
    except Exception as e:
        import traceback
        print("Errore in clear_team:", e)
        print(traceback.format_exc())
        return jsonify({"success": False, "error": "Errore interno"}), 500

# recupero un singolo pokémon dalla squadra 
@team_bp.route('/team/<int:pokemon_id>', methods=['GET'])
@jwt_required()
def get_team_pokemon(pokemon_id):
    try:
        user_id = get_jwt_identity()
        pokemon = TeamPokemon.query.filter_by(id=pokemon_id, user_id=user_id).first()
        if not pokemon:
            return jsonify({"success": False, "error": "Pokémon non trovato nella tua squadra"}), 404
        return jsonify(pokemon.to_dict()), 200
    except Exception as e:
        import traceback
        print("Errore in get_team_pokemon:", e)
        print(traceback.format_exc())
        return jsonify({"success": False, "error": "Errore interno"}), 500