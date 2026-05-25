from pymongo import MongoClient
import os
from config import Config

# Establish connection using the URI configured
client = MongoClient(Config.MONGO_URI)

# Get the database instance. If not specified in the URI, default to 'tourist_db'
db = client.get_database(client.get_default_database().name if client.get_default_database() is not None else 'tourist_db')
