from flask import Blueprint
from controllers.booking_controller import (
    create_booking, get_user_bookings, get_all_bookings, update_booking_status
)
from middleware.auth import token_required, admin_required

booking_bp = Blueprint('bookings', __name__)

@booking_bp.route('', methods=['POST'])
@booking_bp.route('/', methods=['POST'])
@token_required
def add_booking():
    return create_booking()

@booking_bp.route('/user', methods=['GET'])
@booking_bp.route('/my-bookings', methods=['GET'])
@token_required
def list_user_bookings():
    return get_user_bookings()

@booking_bp.route('', methods=['GET'])
@booking_bp.route('/', methods=['GET'])
@admin_required
def list_all_bookings():
    return get_all_bookings()

@booking_bp.route('/<booking_id>/status', methods=['PUT'])
@token_required
def edit_booking_status(booking_id):
    return update_booking_status(booking_id)
