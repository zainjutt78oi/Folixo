from flask import Blueprint, request, jsonify
from flask_login import login_required
from app.services.ai_service import get_ai_suggestions

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/suggest', methods=['POST'])
@login_required
def suggest():
    data     = request.get_json()
    content  = data.get('content', {})
    category = data.get('category', 'resume')
    if not content:
        return jsonify(error='No content'), 400
    result = get_ai_suggestions(content, category)
    return jsonify(result)
