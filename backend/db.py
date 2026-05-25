from pymongo import MongoClient
import os
from config import Config

# Establish connection using the URI configured
client = MongoClient(Config.MONGO_URI)

# Safely get the database instance
try:
    default_db = client.get_default_database()
    db = client.get_database(default_db.name if default_db is not None else 'tourist_db')
except Exception:
    # Fallback to 'tourist_db' if no default database is defined in the connection string
    db = client.get_database('tourist_db')
