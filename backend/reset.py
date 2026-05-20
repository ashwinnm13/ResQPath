from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["resqpath"]

db.ambulances.update_many(
    {},
    {"$set": {"status": "available"}}
)

print("All ambulances reset")