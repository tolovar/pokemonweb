from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

admin_data = []

@admin_bp.route('/data', methods=['GET'])
@jwt_required()
def get_admin_data():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify(admin_data[start:end])

@admin_bp.route('/data', methods=['POST'])
@jwt_required()
def create_admin_data():
    data = request.json
    admin_data.append(data)
    return jsonify(data), 201