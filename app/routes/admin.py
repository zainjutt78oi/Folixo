from flask import Blueprint, render_template, redirect, url_for, request, session, jsonify
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from app import db
from app.models.user import User
from app.models.document import UserDocument
from datetime import datetime, timedelta
from sqlalchemy import func, or_

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    @wraps(f)
    def dec(*a, **kw):
        if not session.get('admin_ok'):
            return redirect(url_for('admin.login'))
        return f(*a, **kw)
    return dec

@admin_bp.route('/login', methods=['GET','POST'])
def login():
    if session.get('admin_ok'):
        return redirect(url_for('admin.dashboard'))
    error = None
    if request.method == 'POST':
        email = request.form.get('email','').strip().lower()
        pw    = request.form.get('password','')
        user  = User.query.filter(User.email==email, User.is_admin==True).first()
        if user and check_password_hash(user.password, pw):
            session['admin_ok'] = True
            session['admin_id'] = user.id
            return redirect(url_for('admin.dashboard'))
        error = 'Invalid credentials.'
    return render_template('admin/login.html', error=error)

@admin_bp.route('/logout')
def logout():
    session.pop('admin_ok', None)
    session.pop('admin_id', None)
    return redirect(url_for('admin.login'))

@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    total_users  = User.query.filter(User.is_admin==False).count()
    active_users = User.query.filter(User.is_admin==False, User.is_banned==False).count()
    banned_users = User.query.filter(User.is_banned==True).count()
    total_docs   = UserDocument.query.count()

    docs_by_cat = db.session.query(
        UserDocument.category, func.count(UserDocument.id)
    ).group_by(UserDocument.category).all()

    weekly = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        count = User.query.filter(
            User.created_at >= day.replace(hour=0,minute=0,second=0),
            User.created_at <  day.replace(hour=23,minute=59,second=59),
            User.is_admin==False
        ).count()
        weekly.append({'day': day.strftime('%a'), 'count': count})

    recent_users = User.query.filter(User.is_admin==False)\
                       .order_by(User.created_at.desc()).limit(8).all()

    top_users = db.session.query(
        User, func.count(UserDocument.id).label('dc')
    ).join(UserDocument, User.id==UserDocument.user_id)\
     .filter(User.is_admin==False)\
     .group_by(User.id)\
     .order_by(func.count(UserDocument.id).desc())\
     .limit(5).all()

    return render_template('admin/dashboard.html',
        total_users=total_users, active_users=active_users,
        banned_users=banned_users, total_docs=total_docs,
        docs_by_cat=docs_by_cat, weekly=weekly,
        recent_users=recent_users, top_users=top_users)

@admin_bp.route('/users')
@admin_required
def users():
    search = request.args.get('q','').strip()
    status = request.args.get('status','all')
    query  = User.query.filter(User.is_admin==False)
    if search:
        query = query.filter(or_(
            User.name.ilike(f'%{search}%'),
            User.email.ilike(f'%{search}%')
        ))
    if status == 'active':
        query = query.filter(User.is_banned==False)
    elif status == 'banned':
        query = query.filter(User.is_banned==True)
    all_users = query.order_by(User.created_at.desc()).all()
    return render_template('admin/users.html',
        users=all_users, search=search, status=status,
        total=User.query.filter(User.is_admin==False).count(),
        active=User.query.filter(User.is_admin==False, User.is_banned==False).count(),
        banned=User.query.filter(User.is_banned==True).count())

@admin_bp.route('/users/<int:uid>')
@admin_required
def user_detail(uid):
    user    = User.query.get_or_404(uid)
    docs    = UserDocument.query.filter_by(user_id=uid)\
                  .order_by(UserDocument.updated_at.desc()).all()
    user_cat = db.session.query(
        UserDocument.category, func.count(UserDocument.id)
    ).filter_by(user_id=uid).group_by(UserDocument.category).all()
    monthly  = db.session.query(
        func.strftime('%Y-%m', UserDocument.created_at).label('month'),
        func.count(UserDocument.id)
    ).filter_by(user_id=uid).group_by('month').order_by('month').all()
    return render_template('admin/user_detail.html',
        user=user, docs=docs, user_cat=user_cat, monthly=monthly)

@admin_bp.route('/users/<int:uid>/ban', methods=['POST'])
@admin_required
def ban_user(uid):
    user = User.query.get_or_404(uid)
    user.is_banned = not user.is_banned
    db.session.commit()
    return jsonify(status='banned' if user.is_banned else 'active')

@admin_bp.route('/users/<int:uid>/reset-password', methods=['POST'])
@admin_required
def reset_password(uid):
    user   = User.query.get_or_404(uid)
    new_pw = request.json.get('password','')
    if len(new_pw) < 6:
        return jsonify(error='Too short'), 400
    user.password = generate_password_hash(new_pw)
    db.session.commit()
    return jsonify(status='ok')

@admin_bp.route('/users/<int:uid>/delete', methods=['DELETE'])
@admin_required
def delete_user(uid):
    user = User.query.get_or_404(uid)
    db.session.delete(user)
    db.session.commit()
    return jsonify(status='deleted')
