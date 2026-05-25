from flask import Blueprint
from controllers.auth_controller import register_user, login_user, get_current_user
from middleware.auth import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    return register_user()

@auth_bp.route('/login', methods=['POST'])
def login():
    return login_user()

@auth_bp.route('/me', methods=['GET'])
@token_required
def me():
    return get_current_user()
