from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["resqpath"]

# Create GeoSpatial Indexes
db.ambulances.create_index([("location", "2dsphere")])
db.hospitals.create_index([("location", "2dsphere")])

ambulances = [
    {
        "name": "Chennai Ambulance 1",
        "location": {
            "type": "Point",
            "coordinates": [80.2707, 13.0827]
        },
        "status": "available"
    },
    {
        "name": "Pondicherry Ambulance 1",
        "location": {
            "type": "Point",
            "coordinates": [79.8307, 11.9416]
        },
        "status": "available"
    }
]

hospitals = [
    {
        "name": "City Hospital",
        "location": {
            "type": "Point",
            "coordinates": [80.2750, 13.0800]
        },
        "beds": 120,
        "occupancy_rate": 72
    },
    {
        "name": "Pondicherry General Hospital",
        "location": {
            "type": "Point",
            "coordinates": [79.8378, 11.9341]
        },
        "beds": 100,
        "occupancy_rate": 65
    }
]

db.ambulances.insert_many(ambulances)
db.hospitals.insert_many(hospitals)

nearest = db.ambulances.find_one({
    "location": {
        "$near": {
            "$geometry": {
                "type": "Point",
                "coordinates": [80.2710, 13.0820]
            }
        }
    }
})

print(nearest)

print("Seeded successfully")