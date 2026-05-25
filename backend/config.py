import os
from datetime import timedelta

# Try loading env variables from .env file if dotenv is available
try:
    from dotenv import load_dotenv
    # Load from the parent or current directory
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
except ImportError:
    pass

class Config:
    PORT = int(os.environ.get('PORT', 5000))
    MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/tourist_db')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'default-jwt-secret-key-for-local-dev-9923')
    
    # Expiry defaults to 7 days
    JWT_EXPIRES_DAYS = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES_DAYS', 7))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=JWT_EXPIRES_DAYS)
    
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
