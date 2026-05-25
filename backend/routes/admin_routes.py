from flask import Blueprint
from controllers.admin_controller import get_admin_stats, get_all_users
from middleware.auth import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
@admin_bp.route('/stats/', methods=['GET'])
@admin_required
def stats():
    return get_admin_stats()

@admin_bp.route('/users', methods=['GET'])
@admin_bp.route('/users/', methods=['GET'])
@admin_required
def users():
    return get_all_users()
