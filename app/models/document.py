from app import db
from datetime import datetime
import json

class UserDocument(db.Model):
    __tablename__ = 'user_documents'
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('templates.id'), nullable=False)
    title       = db.Column(db.String(200), default='Untitled')
    category    = db.Column(db.String(20))
    content     = db.Column(db.Text)
    theme_color = db.Column(db.String(20), default='#6c3fc5')
    font_style  = db.Column(db.String(30), default='modern')
    animation   = db.Column(db.String(30), default='fade')
    layout      = db.Column(db.String(20), default='grid')
    background  = db.Column(db.String(30), default='solid')
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_content(self):
        try: return json.loads(self.content) if self.content else {}
        except: return {}

    def set_content(self, data):
        self.content = json.dumps(data)

    def to_dict(self):
        return dict(id=self.id, title=self.title, category=self.category,
                    template_id=self.template_id, theme_color=self.theme_color,
                    font_style=self.font_style, animation=self.animation,
                    layout=self.layout, background=self.background,
                    created_at=self.created_at.strftime('%d %b %Y'),
                    updated_at=self.updated_at.strftime('%d %b %Y') if self.updated_at else '')
