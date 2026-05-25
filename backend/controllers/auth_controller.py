from flask import request, jsonify, g
from bson.objectid import ObjectId
from db import db
from models.user import UserModel
from config import Config

def register_user():
    """Register a new user or admin."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        # Allow specifying role, but default to 'user'. Hardcode limits if necessary.
        role = data.get('role', 'user').strip().lower()
        
        if role not in ['user', 'admin']:
            role = 'user'
            
        if not name or not email or not password:
            return jsonify({"message": "Name, email, and password are required!"}), 400
            
        # Check if user already exists
        existing_user = db.users.find_one({"email": email})
        if existing_user:
            return jsonify({"message": "A user with this email address already exists!"}), 400
            
        # Hash password and insert user
        hashed_password = UserModel.hash_password(password)
        new_user = {
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "created_at": datetime_now()
        }
        
        result = db.users.insert_one(new_user)
        user_id = str(result.inserted_id)
        
        # Generate token
        token = UserModel.generate_token(user_id, role, Config.JWT_SECRET_KEY, Config.JWT_ACCESS_TOKEN_EXPIRES)
        
        return jsonify({
            "message": "User registered successfully!",
            "token": token,
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
                "role": role
            }
        }), 201
        
    except Exception as e:
        return jsonify({"message": f"Server registration error: {str(e)}"}), 500

def login_user():
    """Login a user or admin."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Credentials are required!"}), 400
            
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({"message": "Email and password are required!"}), 400
            
        user = db.users.find_one({"email": email})
        if not user or not UserModel.check_password(user['password'], password):
            return jsonify({"message": "Invalid email or password!"}), 401
            
        user_id = str(user['_id'])
        role = user.get('role', 'user')
        
        token = UserModel.generate_token(user_id, role, Config.JWT_SECRET_KEY, Config.JWT_ACCESS_TOKEN_EXPIRES)
        
        return jsonify({
            "message": "Login successful!",
            "token": token,
            "user": {
                "id": user_id,
                "name": user.get('name'),
                "email": user.get('email'),
                "role": role
            }
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Server login error: {str(e)}"}), 500

def get_current_user():
    """Get profile details of the authenticated user."""
    # The user details are already resolved by token_required and stored in g.user
    return jsonify({
        "user": g.user
    }), 200

# Helper function to get clean datetime
def datetime_now():
    from datetime import datetime
    return datetime.utcnow()
