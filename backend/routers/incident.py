from fastapi import APIRouter
from db import db
from bson import ObjectId

router = APIRouter()


def convert_object_ids(obj):
    if isinstance(obj, ObjectId):
        return str(obj)
    if isinstance(obj, dict):
        return {k: convert_object_ids(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [convert_object_ids(v) for v in obj]
    return obj


# CREATE INCIDENT
@router.post("/incidents")
async def create_incident(data: dict):

    incident = {
        "patient_name": data["patient_name"],
        "lat": data["lat"],
        "lng": data["lng"],
        "severity": data.get("severity", "UNKNOWN"),
        "status": "active"
    }

    result = await db.incidents.insert_one(
        incident
    )

    await db.ambulances.update_one(
        {"name": "Ambulance 1"},
        {
            "$set": {
                "status": "dispatched"
            }
        }
    )

    return {
        "incident_id":
        str(result.inserted_id)
    }


# GET SINGLE INCIDENT
@router.get("/incidents/{id}")
async def get_incident(id: str):

    incident = await db.incidents.find_one(
        {"_id": ObjectId(id)}
    )

    if incident:
        incident["_id"] = str(
            incident["_id"]
        )

    return incident


# GET ALL INCIDENTS
@router.get("/incidents")
async def get_incidents():

    incidents = await db.incidents.find().to_list(
        length=100
    )

    return [convert_object_ids(incident) for incident in incidents]