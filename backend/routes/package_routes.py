from flask import Blueprint
from controllers.package_controller import (
    get_packages, get_package_by_id, create_package, update_package, delete_package
)
from middleware.auth import admin_required

package_bp = Blueprint('packages', __name__)

@package_bp.route('', methods=['GET'])
@package_bp.route('/', methods=['GET'])
def list_packages():
    return get_packages()

@package_bp.route('/<package_id>', methods=['GET'])
def package_details(package_id):
    return get_package_by_id(package_id)

@package_bp.route('', methods=['POST'])
@package_bp.route('/', methods=['POST'])
@admin_required
def add_package():
    return create_package()

@package_bp.route('/<package_id>', methods=['PUT'])
@admin_required
def edit_package(package_id):
    return update_package(package_id)

@package_bp.route('/<package_id>', methods=['DELETE'])
@admin_required
def remove_package(package_id):
    return delete_package(package_id)
