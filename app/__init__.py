from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
import os

db = SQLAlchemy()
login_manager = LoginManager()

def create_app(config_name='default'):
    app = Flask(__name__,
                template_folder='../templates',
                static_folder='../static')

    from config import config
    app.config.from_object(config[config_name])

    db_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'database')
    os.makedirs(db_dir, exist_ok=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(db_dir,'folixo.db')}"

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    login_manager.login_message_category = 'info'

    from app.routes.auth      import auth_bp
    from app.routes.main      import main_bp
    from app.routes.templates import templates_bp
    from app.routes.editor    import editor_bp
    from app.routes.ai        import ai_bp
    from app.routes.admin     import admin_bp

    app.register_blueprint(auth_bp,      url_prefix='/auth')
    app.register_blueprint(main_bp)
    app.register_blueprint(templates_bp, url_prefix='/templates')
    app.register_blueprint(editor_bp,    url_prefix='/editor')
    app.register_blueprint(ai_bp,        url_prefix='/ai')
    app.register_blueprint(admin_bp,     url_prefix='/admin')

    with app.app_context():
        db.create_all()
        _seed_admin(app)
        _seed_templates()

    return app


def _seed_admin(app):
    from app.models.user import User
    from werkzeug.security import generate_password_hash
    email = app.config['ADMIN_EMAIL']
    if not User.query.filter_by(email=email).first():
        u = User(
            name='Admin', email=email,
            password=generate_password_hash('Admin@Folixo2024!'),
            is_admin=True,
            sq1='What city were you born in?',
            sa1=generate_password_hash('folixo'),
            sq2='What was your childhood nickname?',
            sa2=generate_password_hash('admin'),
            sq3='What was the name of your first pet?',
            sa3=generate_password_hash('folixo')
        )
        db.session.add(u)
        db.session.commit()
        print(f'[Folixo] Admin created: {email}')


def _seed_templates():
    from app.models.template import Template
    if Template.query.count():
        return

    # ONLY Resume and CV — No Portfolio
    templates_data = [
        # ── RESUME ──────────────────────────────────────────
        dict(name='Google Clean',      category='resume', style='modern',   color='#1a73e8'),
        dict(name='Amazon Impact',     category='resume', style='modern',   color='#ff9900'),
        dict(name='Meta Bold',         category='resume', style='modern',   color='#0866ff'),
        dict(name='Apple Minimal',     category='resume', style='minimal',  color='#1d1d1f'),
        dict(name='Microsoft Classic', category='resume', style='classic',  color='#0078d4'),
        dict(name='Netflix Creative',  category='resume', style='creative', color='#e50914'),
        dict(name='Startup Modern',    category='resume', style='modern',   color='#6338d2'),
        dict(name='Executive Pro',     category='resume', style='classic',  color='#1e3a5f'),
        dict(name='Tech Minimal',      category='resume', style='minimal',  color='#2d3748'),
        dict(name='Creative Edge',     category='resume', style='creative', color='#e85d04'),
        # ── CV ──────────────────────────────────────────────
        dict(name='Oxford Scholar',    category='cv', style='classic',  color='#1a237e'),
        dict(name='Research Pro',      category='cv', style='modern',   color='#00695c'),
        dict(name='Academic Elite',    category='cv', style='classic',  color='#4a148c'),
        dict(name='PhD Modern',        category='cv', style='modern',   color='#0277bd'),
        dict(name='Harvard Style',     category='cv', style='classic',  color='#a51c30'),
        dict(name='MIT Technical',     category='cv', style='modern',   color='#750014'),
        dict(name='Minimal Scholar',   category='cv', style='minimal',  color='#37474f'),
        dict(name='Creative Academic', category='cv', style='creative', color='#e64a19'),
        dict(name='Clean CV',          category='cv', style='minimal',  color='#1b5e20'),
        dict(name='Bold Academic',     category='cv', style='creative', color='#880e4f'),
    ]

    for d in templates_data:
        db.session.add(Template(
            name=d['name'], category=d['category'],
            style=d['style'], color_accent=d['color'],
            json_file=f"{d['category']}s/{d['name'].lower().replace(' ','_')}.json",
            is_animated=True, is_active=True
        ))
    db.session.commit()
    print(f'[Folixo] {len(templates_data)} templates seeded (Resume + CV only).')
