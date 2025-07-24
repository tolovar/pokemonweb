from backend.models import db
from marshmallow import Schema, fields, validate

class User(db.Model):
    __tablename__ = 'users'  # plurale per convenzione, occhio al resto del codice!

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())
    last_login = db.Column(db.DateTime, nullable=True)
    last_logout = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    
class UserRegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=32))
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))