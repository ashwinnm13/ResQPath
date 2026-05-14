from fastapi import APIRouter
from db import db

router = APIRouter()

@router.get("/hospitals")
async def nearest_hospitals(
    lat: float,
    lng: float,
    limit: int = 5
):

    hospitals = await db.hospitals.find({
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                }
            }
        }
    }).to_list(length=limit)

    # Convert ObjectId to string
    for hospital in hospitals:
        hospital["_id"] = str(hospital["_id"])

    return hospitals