from fastapi import APIRouter
from db import db
from bson import ObjectId

router = APIRouter()

@router.post("/incidents")
async def create_incident(data: dict):

    incident = {
        "patient_name": data["patient_name"],
        "lat": data["lat"],
        "lng": data["lng"],
        "status": "active"
    }

    result = await db.incidents.insert_one(incident)

    await db.ambulances.update_one(
        {"name": "Ambulance 1"},
        {"$set": {"status": "dispatched"}}
    )

    return {"incident_id": str(result.inserted_id)}


router = APIRouter()

@router.get("/incidents/{id}")
async def get_incident(id: str):

    incident = await db.incidents.find_one(
        {"_id": ObjectId(id)}
    )

    if incident:
        incident["_id"] = str(incident["_id"])

    return incident