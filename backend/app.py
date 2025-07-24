from flask import Flask, jsonify, Response
import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
import logging
from werkzeug.exceptions import HTTPException
import traceback
from datetime import timedelta
# redis serve come storage per il rate limiting
import redis

from backend.models import db
from backend.routes.auth import auth_bp
from backend.routes.users import users_bp
from backend.routes.pokemon import pokemon_bp
from backend.routes.admin import admin_bp
from backend.routes.team import team_bp  
from backend.routes.error_handlers import register_error_handlers

# carico le variabili d'ambiente da .env
load_dotenv()  

app = Flask(__name__)
# fLASK-CORS aggiunge automaticamente gli header CORS
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# configurazione da .env
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# configuro Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
# timer di 8 ore per il token 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8) 

db.init_app(app)
jwt = JWTManager(app)
mail = Mail(app)
limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri="redis://localhost:6379"  # redis deve essere attivo
)
migrate = Migrate(app, db)

# logging
logging.basicConfig(
    filename='app.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s'
)

# registra blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(pokemon_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(team_bp)

# registro error handlers così da non doverli ripetere in ogni blueprint
# questo permette di centralizzare la gestione degli errori
register_error_handlers(app)
# handler errori personalizzati
@app.errorhandler(400)
def bad_request(error) -> tuple[Response, int]:
    logging.warning(f"400: {error}")
    return jsonify({"success": False, "error": "Bad request"}), 400

@app.errorhandler(401)
def unauthorized(error) -> tuple[Response, int]:
    logging.warning(f"401: {error}")
    return jsonify({"success": False, "error": "Unauthorized"}), 401

@app.errorhandler(404)
def not_found(error) -> tuple[Response, int]:
    logging.warning(f"404: {error}")
    return jsonify({"success": False, "error": "Not found"}), 404

@app.errorhandler(405)
def method_not_allowed(error) -> tuple[Response, int]:
    logging.warning(f"405: {error}")
    return jsonify({"success": False, "error": "Method not allowed"}), 405

@app.errorhandler(409)
def conflict(error) -> tuple[Response, int]:
    logging.warning(f"409: {error}")
    return jsonify({"success": False, "error": "Conflict"}), 409

# error handler globale
@app.errorhandler(Exception)
def handle_exception(e) -> tuple[Response, int]:
    if isinstance(e, HTTPException):
        code = e.code if e.code is not None else 500
        logging.error(f"HTTPException: {e.description} (code: {code})")
        return jsonify({"success": False, "error": e.description}), code
    logging.error(f"Unhandled Exception: {e}\n{traceback.format_exc()}")
    return jsonify({"success": False, "error": "Errore interno inatteso"}), 500

if __name__ == '__main__':
    app.run(debug=True)
