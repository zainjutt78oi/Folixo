from app import db, login_manager
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), unique=True, nullable=False)
    password   = db.Column(db.String(255), nullable=False)
    is_admin   = db.Column(db.Boolean, default=False)
    is_banned  = db.Column(db.Boolean, default=False)
    theme      = db.Column(db.String(10), default='light')
    # 3 security questions
    sq1 = db.Column(db.String(200))
    sa1 = db.Column(db.String(255))
    sq2 = db.Column(db.String(200))
    sa2 = db.Column(db.String(255))
    sq3 = db.Column(db.String(200))
    sa3 = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    documents  = db.relationship('UserDocument', backref='owner', lazy=True, cascade='all,delete-orphan')

    def get_initials(self):
        parts = self.name.strip().split()
        return (parts[0][0] + parts[-1][0]).upper() if len(parts) >= 2 else self.name[:2].upper()

    def doc_count(self):
        return len(self.documents)

@login_manager.user_loader
def load_user(uid):
    return User.query.get(int(uid))
