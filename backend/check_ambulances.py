from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["resqpath"]

print("\n=== ALL AMBULANCES IN DATABASE ===\n")

ambulances = db.ambulances.find()
for amb in ambulances:
    coords = amb["location"]["coordinates"]
    print(f"Name: {amb['name']}")
    print(f"  ID: {amb['_id']}")
    print(f"  Location: [{coords[1]}, {coords[0]}]")
    print(f"  Status: {amb['status']}")
    print()

print(f"\nTotal ambulances: {db.ambulances.count_documents({})}")
print(f"Available ambulances: {db.ambulances.count_documents({'status': 'available'})}")

# Check indexes
print("\n=== AMBULANCES INDEX INFO ===\n")
indexes = db.ambulances.index_information()
for index_name, index_info in indexes.items():
    print(f"Index: {index_name}")
    print(f"  Keys: {index_info['key']}")
    print()

# Test geospatial query with a sample location (Kodambakkam, Chennai)
print("\n=== TEST GEOSPATIAL QUERY ===\n")
test_lat = 13.0465
test_lng = 80.2342

print(f"Testing with location: [{test_lat}, {test_lng}]")
print()

nearby = db.ambulances.find({
    "status": "available",
    "location": {
        "$near": {
            "$geometry": {
                "type": "Point",
                "coordinates": [test_lng, test_lat]
            }
        }
    }
}).limit(3)

for amb in nearby:
    coords = amb["location"]["coordinates"]
    print(f"✓ {amb['name']} at [{coords[1]}, {coords[0]}]")
