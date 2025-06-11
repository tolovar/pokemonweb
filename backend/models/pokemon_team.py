from backend.models import db

class PokemonTeam(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "name": self.name}