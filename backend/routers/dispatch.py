from fastapi import APIRouter, HTTPException
from pydantic import BaseModel , Field
from db import db
from bson import ObjectId
import joblib
import pandas as pd
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Load ML model
model = joblib.load("ml/model.pkl")

ORS_API_KEY = os.getenv("ORS_API_KEY")


# -----------------------------
# Request Schema
# -----------------------------
class DispatchRequest(BaseModel):

    patient_name: str

    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)

    age: int
    heart_rate: int
    bp_sys: int
    bp_dia: int
    spo2: int
    resp_rate: int
    pain_score: int

    chest_pain: int
    breathing_issue: int
    bleeding: int
    unconscious: int


# -----------------------------
# Dispatch Endpoint
# -----------------------------
@router.post("/dispatch")
async def dispatch(data: DispatchRequest):

    # =========================================
    # STEP 1 → ML Prediction
    # =========================================

    input_df = pd.DataFrame([{
        "age": data.age,
        "heart_rate": data.heart_rate,
        "bp_sys": data.bp_sys,
        "bp_dia": data.bp_dia,
        "spo2": data.spo2,
        "resp_rate": data.resp_rate,
        "pain_score": data.pain_score,
        "chest_pain": data.chest_pain,
        "breathing_issue": data.breathing_issue,
        "bleeding": data.bleeding,
        "unconscious": data.unconscious
    }])

    prediction = model.predict(input_df)[0]

    labels = {
        0: "LOW",
        1: "MEDIUM",
        2: "CRITICAL"
    }

    severity = labels[prediction]

    # =========================================
    # STEP 2 → Find Nearest Ambulance
    # =========================================

    ambulance = await db.ambulances.find_one({
        "status": "available",
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [data.lng, data.lat]
                }
            }
        }
    })

    if not ambulance:
        raise HTTPException(
            status_code=503,
            detail="No ambulance available"
        )

    # =========================================
    # STEP 3 → Find Best Hospital
    # =========================================

    hospitals_cursor = db.hospitals.find({
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [data.lng, data.lat]
                }
            }
        }
    })

    hospitals = await hospitals_cursor.to_list(length=5)

    best_hospital = hospitals[0]

    # =========================================
    # STEP 4 → Fetch Route from ORS
    # =========================================

    ors_url = "https://api.openrouteservice.org/v2/directions/driving-car"

    body = {
        "coordinates": [
            ambulance["location"]["coordinates"],
            [data.lng, data.lat],
            best_hospital["location"]["coordinates"]
        ]
    }

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                ors_url,
                json=body,
                headers=headers
            )

        route_data = response.json()

        route = route_data["routes"][0]

        distance_km = round(
            route["summary"]["distance"] / 1000,
            2
        )

        duration_minutes = round(
            route["summary"]["duration"] / 60,
            2
        )

        polyline = route["geometry"]

    except Exception:
        distance_km = 0
        duration_minutes = 0
        polyline = "Route unavailable"

    # =========================================
    # STEP 5 → Create Incident
    # =========================================

    incident = {
        "patient_name": data.patient_name,

        "severity": severity,

        "location": {
            "type": "Point",
            "coordinates": [data.lng, data.lat]
        },

        "ambulance_id": ambulance["_id"],
        "hospital_id": best_hospital["_id"],

        "status": "active"
    }

    result = await db.incidents.insert_one(incident)

    # =========================================
    # STEP 6 → Update Ambulance Status
    # =========================================

    await db.ambulances.update_one(
        {"_id": ambulance["_id"]},
        {
            "$set": {
                "status": "dispatched"
            }
        }
    )

    # =========================================
    # FINAL RESPONSE
    # =========================================

    return {

        "incident_id": str(result.inserted_id),

        "severity": severity,

        "ambulance": {
            "id": str(ambulance["_id"]),
            "name": ambulance["name"]
        },

        "hospital": {
            "id": str(best_hospital["_id"]),
            "name": best_hospital["name"]
        },

        "route": {
           "distance_km": distance_km,
           "duration_minutes": duration_minutes,
           "polyline": polyline
}
    }