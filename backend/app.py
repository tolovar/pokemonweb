from flask import Flask, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_migrate import Migrate
import logging

from backend.models import db
from backend.routes.auth import auth_bp
from backend.routes.users import users_bp
from backend.routes.pokemon import pokemon_bp
from backend.routes.admin import admin_bp

load_dotenv()

app = Flask(__name__)
# fLASK-CORS aggiunge automaticamente gli header CORS
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# configurazione da .env
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# configuro Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

db.init_app(app)
jwt = JWTManager(app)
mail = Mail(app)
limiter = Limiter(get_remote_address, app=app, default_limits=["10 per minute"])
migrate = Migrate(app, db)

# registra blueprint
app.register_blueprint(auth_bp)
app.register_blueprint(users_bp)
app.register_blueprint(pokemon_bp)
app.register_blueprint(admin_bp)

# logging
logging.basicConfig(filename='app.log', level=logging.INFO)

# gestisco gli errori
@app.errorhandler(400)
def bad_request(error):
    logging.warning(f"400: {error}")
    return jsonify({"success": False, "error": "Bad request"}), 400

@app.errorhandler(401)
def unauthorized(error):
    logging.warning(f"401: {error}")
    return jsonify({"success": False, "error": "Unauthorized"}), 401

@app.errorhandler(404)
def not_found(error):
    logging.warning(f"404: {error}")
    return jsonify({"success": False, "error": "Not found"}), 404

@app.errorhandler(409)
def conflict(error):
    logging.warning(f"409: {error}")
    return jsonify({"success": False, "error": "Conflict"}), 409

@app.errorhandler(500)
def internal_error(error):
    logging.error(f"500: {error}")
    return jsonify({"success": False, "error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
