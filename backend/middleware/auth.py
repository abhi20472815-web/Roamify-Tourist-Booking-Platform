from flask import request, jsonify, g
from functools import wraps
from bson.objectid import ObjectId
from models.user import UserModel
from config import Config
from db import db

def token_required(f):
    """Decorator to require a valid JWT token for a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Look for JWT in Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Expecting format "Bearer <token>"
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({"message": "Invalid Authorization header format. Use Bearer <token>"}), 401
                
        if not token:
            return jsonify({"message": "Access token is missing!"}), 401
            
        # Decode and validate token
        result = UserModel.decode_token(token, Config.JWT_SECRET_KEY)
        if not result['valid']:
            return jsonify({"message": result['error']}), 401
            
        try:
            # Query the user from the database
            user = db.users.find_one({"_id": ObjectId(result['user_id'])})
            if not user:
                return jsonify({"message": "User not found in the system!"}), 401
                
            # Remove password hash for safety
            user['_id'] = str(user['_id'])
            if 'password' in user:
                del user['password']
                
            # Store in Flask's global context
            g.user = user
        except Exception as e:
            return jsonify({"message": f"Authentication database error: {str(e)}"}), 500
            
        return f(*args, **kwargs)
        
    return decorated

def admin_required(f):
    """Decorator to require a valid JWT token AND admin role for a route."""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        # The user object is guaranteed to be in g.user since @token_required runs first
        if g.user.get('role') != 'admin':
            return jsonify({"message": "Admin privileges required for this operation!"}), 403
        return f(*args, **kwargs)
        
    return decorated
