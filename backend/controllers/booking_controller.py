from flask import request, jsonify, g
from bson.objectid import ObjectId
from db import db
from datetime import datetime

def create_booking():
    """Create a new tour booking for the current authenticated user."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Booking details are required!"}), 400
            
        package_id = data.get('package_id', '').strip()
        travel_date = data.get('travel_date', '').strip()
        guests = data.get('guests')
        
        if not package_id or not travel_date or guests is None:
            return jsonify({"message": "Package, travel date, and number of guests are required!"}), 400
            
        try:
            guests = int(guests)
            if guests <= 0:
                return jsonify({"message": "Number of guests must be at least 1!"}), 400
        except ValueError:
            return jsonify({"message": "Guests must be a valid integer number!"}), 400
            
        # Verify package exists and get price
        if not ObjectId.is_valid(package_id):
            return jsonify({"message": "Invalid package ID format!"}), 400
            
        package = db.packages.find_one({"_id": ObjectId(package_id)})
        if not package:
            return jsonify({"message": "The selected tour package does not exist!"}), 404
            
        price_per_person = float(package.get('price', 0))
        total_price = price_per_person * guests
        
        # Parse payment info from request body
        payment_status = data.get('payment_status', 'pending').strip().lower()
        transaction_id = data.get('transaction_id', '').strip()
        
        # If paid, auto-confirm reservation status
        booking_status = "confirmed" if payment_status == "paid" else "pending"
        
        # Build booking document
        new_booking = {
            "user_id": str(g.user['_id']),
            "user_name": g.user.get('name'),
            "user_email": g.user.get('email'),
            "package_id": str(package['_id']),
            "package_title": package.get('title'),
            "package_location": package.get('location'),
            "package_image": package.get('images', [""])[0],
            "duration": package.get('duration'),
            "travel_date": travel_date,
            "guests": guests,
            "price_per_person": price_per_person,
            "total_price": total_price,
            "status": booking_status,  # pending, confirmed, cancelled
            "payment_status": payment_status,  # pending, paid, failed
            "transaction_id": transaction_id,
            "created_at": datetime.utcnow()
        }
        
        result = db.bookings.insert_one(new_booking)
        new_booking['_id'] = str(result.inserted_id)
        
        # Serialize datetime object for JSON response
        new_booking['created_at'] = new_booking['created_at'].isoformat()
        
        return jsonify({
            "message": "Booking placed successfully!",
            "booking": new_booking
        }), 201
        
    except Exception as e:
        return jsonify({"message": f"Server error placing booking: {str(e)}"}), 500

def get_user_bookings():
    """Get all bookings associated with the current authenticated user."""
    try:
        user_id = str(g.user['_id'])
        bookings = list(db.bookings.find({"user_id": user_id}).sort("created_at", -1))
        
        # Serialize documents
        for booking in bookings:
            booking['_id'] = str(booking['_id'])
            if isinstance(booking.get('created_at'), datetime):
                booking['created_at'] = booking['created_at'].isoformat()
                
        return jsonify(bookings), 200
        
    except Exception as e:
        return jsonify({"message": f"Server error fetching personal bookings: {str(e)}"}), 500

def get_all_bookings():
    """Get all bookings across the platform (Admin only)."""
    try:
        bookings = list(db.bookings.find().sort("created_at", -1))
        
        # Serialize
        for booking in bookings:
            booking['_id'] = str(booking['_id'])
            if isinstance(booking.get('created_at'), datetime):
                booking['created_at'] = booking['created_at'].isoformat()
                
        return jsonify(bookings), 200
        
    except Exception as e:
        return jsonify({"message": f"Server error fetching all bookings: {str(e)}"}), 500

def update_booking_status(booking_id):
    """Update status of a booking (Admin only, or user cancellation)."""
    try:
        if not ObjectId.is_valid(booking_id):
            return jsonify({"message": "Invalid booking ID format!"}), 400
            
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"message": "New status value is required!"}), 400
            
        status = data['status'].strip().lower()
        if status not in ['pending', 'confirmed', 'cancelled']:
            return jsonify({"message": "Status must be pending, confirmed, or cancelled!"}), 400
            
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"message": "Booking not found!"}), 404
            
        # Security: If current user is not admin, they can ONLY change status to 'cancelled' on their own booking
        is_admin = g.user.get('role') == 'admin'
        if not is_admin:
            if booking.get('user_id') != str(g.user['_id']):
                return jsonify({"message": "You do not have permission to modify this booking!"}), 403
            if status != 'cancelled':
                return jsonify({"message": "Users can only cancel their bookings!"}), 400
                
        # Perform status update
        db.bookings.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": status}}
        )
        
        return jsonify({
            "message": f"Booking status updated to {status} successfully!",
            "booking_id": booking_id,
            "status": status
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Server error updating booking status: {str(e)}"}), 500
