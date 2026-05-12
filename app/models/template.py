from app import db
from datetime import datetime

class Template(db.Model):
    __tablename__ = 'templates'
    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(100), nullable=False)
    category     = db.Column(db.String(20), nullable=False)
    style        = db.Column(db.String(30), nullable=False)
    json_file    = db.Column(db.String(200), nullable=False)
    color_accent = db.Column(db.String(20), default='#6c3fc5')
    is_animated  = db.Column(db.Boolean, default=True)
    is_active    = db.Column(db.Boolean, default=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    documents    = db.relationship('UserDocument', backref='template', lazy=True)

    def to_dict(self):
        return dict(id=self.id, name=self.name, category=self.category,
                    style=self.style, color_accent=self.color_accent,
                    is_animated=self.is_animated)
