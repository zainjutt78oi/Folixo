from flask import Blueprint, render_template, request, jsonify, send_file
from flask_login import login_required, current_user
from app import db
from app.models.template import Template
from app.models.document import UserDocument
import io

editor_bp = Blueprint('editor', __name__)

@editor_bp.route('/<int:tid>')
@login_required
def open_editor(tid):
    tmpl  = Template.query.get_or_404(tid)
    doc_id = request.args.get('doc_id')
    doc   = UserDocument.query.filter_by(id=doc_id, user_id=current_user.id).first() if doc_id else None
    return render_template('editor/resume.html', tmpl=tmpl, doc=doc)

@editor_bp.route('/save', methods=['POST'])
@login_required
def save():
    d           = request.get_json()
    doc_id      = d.get('doc_id')
    template_id = d.get('template_id')
    tmpl = Template.query.get(template_id)
    if not tmpl: return jsonify(error='Template not found'), 404

    if doc_id:
        doc = UserDocument.query.filter_by(id=doc_id, user_id=current_user.id).first()
        if not doc: return jsonify(error='Not found'), 404
    else:
        doc = UserDocument(user_id=current_user.id, template_id=template_id, category=tmpl.category)
        db.session.add(doc)

    doc.title       = d.get('title','Untitled')
    doc.theme_color = d.get('theme_color','#1a73e8')
    doc.font_style  = d.get('font_style','Inter')
    doc.layout      = d.get('layout','single-column')
    doc.set_content(d.get('content',{}))
    db.session.commit()
    return jsonify(status='saved', doc_id=doc.id)

@editor_bp.route('/load/<int:doc_id>')
@login_required
def load(doc_id):
    doc = UserDocument.query.filter_by(id=doc_id, user_id=current_user.id).first_or_404()
    return jsonify(**doc.to_dict(), content=doc.get_content())

@editor_bp.route('/delete/<int:doc_id>', methods=['DELETE'])
@login_required
def delete(doc_id):
    doc = UserDocument.query.filter_by(id=doc_id, user_id=current_user.id).first_or_404()
    db.session.delete(doc)
    db.session.commit()
    return jsonify(status='deleted')

@editor_bp.route('/export/<int:doc_id>', methods=['POST'])
@login_required
def export_pdf(doc_id):
    doc = UserDocument.query.filter_by(id=doc_id, user_id=current_user.id).first_or_404()
    try:
        from app.utils.pdf_generator import generate_pdf
        pdf_bytes = generate_pdf(doc, current_user)
        return send_file(io.BytesIO(pdf_bytes), mimetype='application/pdf',
                         as_attachment=True,
                         download_name=f"{doc.title.replace(' ','_')}.pdf")
    except Exception as e:
        return jsonify(error=str(e)), 500
