from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.document import UserDocument
from app.models.template import Template

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    total_templates = Template.query.filter_by(is_active=True).count()
    return render_template('index.html', total_templates=total_templates)

@main_bp.route('/dashboard')
@login_required
def dashboard():
    # Admin ko admin panel pe bhejo
    if current_user.is_admin:
        return redirect(url_for('admin.dashboard'))
    docs = UserDocument.query.filter_by(user_id=current_user.id)\
               .order_by(UserDocument.updated_at.desc()).all()
    return render_template('dashboard/index.html', docs=docs,
        resume_count=sum(1 for d in docs if d.category=='resume'),
        cv_count=sum(1 for d in docs if d.category=='cv'),
        portfolio_count=0)

@main_bp.route('/set-theme', methods=['POST'])
@login_required
def set_theme():
    theme = request.json.get('theme','light')
    current_user.theme = theme
    db.session.commit()
    return jsonify(status='ok')

@main_bp.route('/contact')
def contact():
    return render_template('contact.html')
