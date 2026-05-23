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
    # Pondicherry ambulances - 6 units for local coverage
    {
        "name": "Pondy Ambulance 1",
        "location": {"type": "Point", "coordinates": [79.8380, 11.9345]},
        "status": "available"
    },
    {
        "name": "Pondy Ambulance 2",
        "location": {"type": "Point", "coordinates": [79.8350, 11.9400]},
        "status": "available"
    },
    {
        "name": "Pondy Ambulance 3",
        "location": {"type": "Point", "coordinates": [79.8470, 11.9490]},
        "status": "available"
    },
    {
        "name": "Pondy Ambulance 4",
        "location": {"type": "Point", "coordinates": [79.8200, 11.9300]},
        "status": "available"
    },
    {
        "name": "Pondy Ambulance 5",
        "location": {"type": "Point", "coordinates": [79.8600, 11.9400]},
        "status": "available"
    },
    {
        "name": "Pondy Ambulance 6",
        "location": {"type": "Point", "coordinates": [79.8400, 11.9600]},
        "status": "available"
    }
]

hospitals = [
   
    # Pondicherry Hospitals
    {
        "name": "JIPMER",
        "location": {
            "type": "Point",
            "coordinates": [79.8450, 11.9500]
        },
        "beds": 200,
        "occupancy_rate": 70
    },
    {
        "name": "Indira Gandhi Government General Hospital",
        "location": {
            "type": "Point",
            "coordinates": [79.8350, 11.9400]
        },
        "beds": 180,
        "occupancy_rate": 68
    },
    {
        "name": "Rajiv Gandhi Government Women and Children Hospital",
        "location": {
            "type": "Point",
            "coordinates": [79.8300, 11.9300]
        },
        "beds": 140,
        "occupancy_rate": 72
    },
    {
        "name": "ESI Corporation Hospital",
        "location": {
            "type": "Point",
            "coordinates": [79.8400, 11.9200]
        },
        "beds": 100,
        "occupancy_rate": 65
    },
    {
        "name": "Aarupadai Veedu Medical College and Hospital",
        "location": {
            "type": "Point",
            "coordinates": [79.8550, 11.9350]
        },
        "beds": 150,
        "occupancy_rate": 69
    },
    {
        "name": "Mahatma Gandhi Medical College & Research Institute",
        "location": {
            "type": "Point",
            "coordinates": [79.8250, 11.9450]
        },
        "beds": 170,
        "occupancy_rate": 71
    },
    {
        "name": "Pondicherry Institute of Medical Sciences",
        "location": {
            "type": "Point",
            "coordinates": [79.8600, 11.9400]
        },
        "beds": 160,
        "occupancy_rate": 70
    },
    {
        "name": "East Coast Hospitals",
        "location": {
            "type": "Point",
            "coordinates": [79.8480, 11.9250]
        },
        "beds": 120,
        "occupancy_rate": 67
    },
    {
        "name": "Westmed Multispeciality Hospital",
        "location": {
            "type": "Point",
            "coordinates": [79.8320, 11.9550]
        },
        "beds": 110,
        "occupancy_rate": 66
    },
    {
        "name": "Sri Manakula Vinayagar Medical College and Hospital",
        "location": {
            "type": "Point",
            "coordinates": [79.8400, 11.9600]
        },
        "beds": 130,
        "occupancy_rate": 68
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