import jwt
from datetime import datetime, timedelta
import os
from bson.objectid import ObjectId

# Password hashing with bcrypt, fallback to werkzeug.security for seamless compatibility
try:
    import bcrypt
    HAS_BCRYPT = True
except ImportError:
    from werkzeug.security import generate_password_hash, check_password_hash
    HAS_BCRYPT = False

class UserModel:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a plain text password."""
        if not password:
            return ""
        if HAS_BCRYPT:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
            return hashed.decode('utf-8')
        else:
            return generate_password_hash(password)

    @staticmethod
    def check_password(hashed_password: str, password: str) -> bool:
        """Verify hashed password against plain text."""
        if not hashed_password or not password:
            return False
        if HAS_BCRYPT:
            try:
                return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
            except Exception:
                # In case of format issues, try fallback to check if it was hashed with werkzeug
                try:
                    return check_password_hash(hashed_password, password)
                except Exception:
                    return False
        else:
            return check_password_hash(hashed_password, password)

    @staticmethod
    def generate_token(user_id: str, role: str, secret_key: str, expires_delta: timedelta) -> str:
        """Generate JWT access token."""
        payload = {
            'sub': str(user_id),
            'role': role,
            'iat': datetime.utcnow(),
            'exp': datetime.utcnow() + expires_delta
        }
        return jwt.encode(payload, secret_key, algorithm='HS256')

    @staticmethod
    def decode_token(token: str, secret_key: str) -> dict:
        """Decode and validate a JWT access token."""
        try:
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return {
                'valid': True,
                'user_id': payload['sub'],
                'role': payload.get('role', 'user'),
                'payload': payload
            }
        except jwt.ExpiredSignatureError:
            return {'valid': False, 'error': 'Token has expired'}
        except jwt.InvalidTokenError as e:
            return {'valid': False, 'error': f'Invalid token: {str(e)}'}
