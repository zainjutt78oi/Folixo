from flask import Blueprint, render_template, redirect, url_for, request, flash, session, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['GET','POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    questions = current_app.config.get('SECURITY_QUESTIONS', [])
    if request.method == 'POST':
        name  = request.form.get('name','').strip()
        email = request.form.get('email','').strip().lower()
        pw    = request.form.get('password','')
        pw2   = request.form.get('confirm_password','')
        sq1   = request.form.get('sq1','')
        sa1   = request.form.get('sa1','').strip().lower()
        sq2   = request.form.get('sq2','')
        sa2   = request.form.get('sa2','').strip().lower()
        sq3   = request.form.get('sq3','')
        sa3   = request.form.get('sa3','').strip().lower()

        errors = []
        if len(name) < 2:        errors.append('Name must be at least 2 characters.')
        if '@' not in email:     errors.append('Valid email required.')
        if len(pw) < 8:          errors.append('Password must be at least 8 characters.')
        if pw != pw2:            errors.append('Passwords do not match.')
        if not sq1 or not sa1:   errors.append('Security question 1 is required.')
        if not sq2 or not sa2:   errors.append('Security question 2 is required.')
        if not sq3 or not sa3:   errors.append('Security question 3 is required.')
        if sq1 == sq2 or sq2 == sq3 or sq1 == sq3:
            errors.append('Please choose 3 different security questions.')
        if User.query.filter_by(email=email).first():
            errors.append('Email already registered.')

        if errors:
            for e in errors: flash(e, 'danger')
            return render_template('auth/register.html', questions=questions, form=request.form)

        user = User(
            name=name, email=email,
            password=generate_password_hash(pw),
            sq1=sq1, sa1=generate_password_hash(sa1),
            sq2=sq2, sa2=generate_password_hash(sa2),
            sq3=sq3, sa3=generate_password_hash(sa3),
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        flash(f'Welcome to Folixo, {name}! 🎉', 'success')
        return redirect(url_for('main.dashboard'))
    return render_template('auth/register.html', questions=questions, form={})

@auth_bp.route('/login', methods=['GET','POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    if request.method == 'POST':
        email = request.form.get('email','').strip().lower()
        pw    = request.form.get('password','')
        remember = request.form.get('remember') == 'on'
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.password, pw):
            flash('Invalid email or password.', 'danger')
            return render_template('auth/login.html', email=email)
        if user.is_banned:
            flash('Your account has been suspended.', 'danger')
            return render_template('auth/login.html', email=email)
        login_user(user, remember=remember)
        # Admin ko admin panel pe bhejo
        if user.is_admin:
            session['admin_ok'] = True
            session['admin_id'] = user.id
            return redirect(url_for('admin.dashboard'))
        flash(f'Welcome back, {user.name}! 👋', 'success')
        return redirect(request.args.get('next') or url_for('main.dashboard'))
    return render_template('auth/login.html', email='')

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.', 'info')
    return redirect(url_for('main.index'))

# ── Password Reset via Security Questions ─────────────────────────

@auth_bp.route('/forgot-password', methods=['GET','POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email','').strip().lower()
        user  = User.query.filter_by(email=email).first()
        if user:
            session['reset_uid'] = user.id
        # Always redirect — don't reveal if email exists
        return redirect(url_for('auth.verify_q1'))
    return render_template('auth/forgot_password.html')

@auth_bp.route('/verify-q1', methods=['GET','POST'])
def verify_q1():
    uid = session.get('reset_uid')
    if not uid: return redirect(url_for('auth.forgot_password'))
    user = User.query.get(uid)
    if not user: return redirect(url_for('auth.forgot_password'))
    if request.method == 'POST':
        ans = request.form.get('answer','').strip().lower()
        if user.sa1 and check_password_hash(user.sa1, ans):
            session['reset_q1_ok'] = True
            return redirect(url_for('auth.verify_q2'))
        flash('Incorrect answer. Try again.', 'danger')
    return render_template('auth/verify_q.html', question=user.sq1, step=1, total=3)

@auth_bp.route('/verify-q2', methods=['GET','POST'])
def verify_q2():
    if not session.get('reset_q1_ok'): return redirect(url_for('auth.forgot_password'))
    uid  = session.get('reset_uid')
    user = User.query.get(uid)
    if not user: return redirect(url_for('auth.forgot_password'))
    if request.method == 'POST':
        ans = request.form.get('answer','').strip().lower()
        if user.sa2 and check_password_hash(user.sa2, ans):
            session['reset_q2_ok'] = True
            return redirect(url_for('auth.verify_q3'))
        flash('Incorrect answer. Try again.', 'danger')
    return render_template('auth/verify_q.html', question=user.sq2, step=2, total=3)

@auth_bp.route('/verify-q3', methods=['GET','POST'])
def verify_q3():
    if not session.get('reset_q2_ok'): return redirect(url_for('auth.forgot_password'))
    uid  = session.get('reset_uid')
    user = User.query.get(uid)
    if not user: return redirect(url_for('auth.forgot_password'))
    if request.method == 'POST':
        ans = request.form.get('answer','').strip().lower()
        if user.sa3 and check_password_hash(user.sa3, ans):
            session['reset_verified'] = True
            return redirect(url_for('auth.reset_password'))
        flash('Incorrect answer. Try again.', 'danger')
    return render_template('auth/verify_q.html', question=user.sq3, step=3, total=3)

@auth_bp.route('/reset-password', methods=['GET','POST'])
def reset_password():
    if not session.get('reset_verified'): return redirect(url_for('auth.forgot_password'))
    uid  = session.get('reset_uid')
    user = User.query.get(uid)
    if not user: return redirect(url_for('auth.forgot_password'))
    if request.method == 'POST':
        pw  = request.form.get('password','')
        pw2 = request.form.get('confirm_password','')
        if len(pw) < 8:
            flash('Password must be at least 8 characters.', 'danger')
            return render_template('auth/reset_password.html')
        if pw != pw2:
            flash('Passwords do not match.', 'danger')
            return render_template('auth/reset_password.html')
        user.password = generate_password_hash(pw)
        db.session.commit()
        for k in ['reset_uid','reset_q1_ok','reset_q2_ok','reset_verified']:
            session.pop(k, None)
        flash('Password reset! Please login.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('auth/reset_password.html')
