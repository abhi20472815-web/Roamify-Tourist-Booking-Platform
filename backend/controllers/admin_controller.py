from flask import jsonify
from db import db
from datetime import datetime

def get_admin_stats():
    """Retrieve overall system statistics for the admin dashboard."""
    try:
        total_packages = db.packages.count_documents({})
        total_bookings = db.bookings.count_documents({})
        total_users = db.users.count_documents({})
        
        # Calculate revenue from confirmed bookings
        pipeline = [
            {"$match": {"status": "confirmed"}},
            {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
        ]
        revenue_result = list(db.bookings.aggregate(pipeline))
        total_revenue = revenue_result[0]['total'] if revenue_result else 0.0
        
        # Fetch 5 most recent bookings
        recent_bookings = list(db.bookings.find().sort("created_at", -1).limit(5))
        for booking in recent_bookings:
            booking['_id'] = str(booking['_id'])
            if isinstance(booking.get('created_at'), datetime):
                booking['created_at'] = booking['created_at'].isoformat()
                
        return jsonify({
            "total_packages": total_packages,
            "total_bookings": total_bookings,
            "total_users": total_users,
            "total_revenue": total_revenue,
            "recent_bookings": recent_bookings
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Server error aggregating admin statistics: {str(e)}"}), 500

def get_all_users():
    """List all user profiles in the database (Admin only)."""
    try:
        users = list(db.users.find({}, {"password": 0}).sort("created_at", -1))
        
        # Serialize ids and dates
        for user in users:
            user['_id'] = str(user['_id'])
            if isinstance(user.get('created_at'), datetime):
                user['created_at'] = user['created_at'].isoformat()
                
        return jsonify(users), 200
        
    except Exception as e:
        return jsonify({"message": f"Server error fetching users list: {str(e)}"}), 500
