from fastapi import APIRouter
from db import db

router = APIRouter()

@router.get("/ambulances/nearest")
async def nearest_ambulance(lat: float, lng: float):

    ambulance = await db.ambulances.find_one({
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                }
            }
        }
    })

    # Convert ObjectId to string
    ambulance["_id"] = str(ambulance["_id"])

    return ambulance