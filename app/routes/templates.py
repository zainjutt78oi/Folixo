from flask import Blueprint, render_template, request, jsonify
from app.models.template import Template

templates_bp = Blueprint('templates', __name__)

@templates_bp.route('/')
def browse():
    templates = Template.query.filter_by(is_active=True).order_by(Template.category, Template.name).all()
    return render_template('templates/browse.html', templates=templates)

@templates_bp.route('/<int:tid>')
def preview(tid):
    tmpl    = Template.query.get_or_404(tid)
    related = Template.query.filter_by(category=tmpl.category, is_active=True)\
                  .filter(Template.id!=tid).limit(4).all()
    return render_template('templates/preview.html', tmpl=tmpl, related=related)

@templates_bp.route('/api')
def api():
    q = Template.query.filter_by(is_active=True)
    cat   = request.args.get('category')
    style = request.args.get('style')
    if cat:   q = q.filter_by(category=cat)
    if style: q = q.filter_by(style=style)
    return jsonify([t.to_dict() for t in q.all()])
