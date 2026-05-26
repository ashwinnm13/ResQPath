from fastapi import APIRouter, HTTPException
from pydantic import BaseModel , Field
from db import db
from bson import ObjectId
import joblib
import pandas as pd
import httpx
import os
from dotenv import load_dotenv
from utils.feature_mapper import map_symptoms_to_features

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

    age: int
    pain_score: int
    symptoms: list  # ["chest_pain", "breathing_issue", etc.]

    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


# -----------------------------
# Dispatch Endpoint
# -----------------------------
@router.post("/dispatch")
async def dispatch(data: DispatchRequest):

    # =========================================
    # STEP 1 → Map Symptoms to Features
    # =========================================

    features = map_symptoms_to_features({
        "age": data.age,
        "pain_score": data.pain_score,
        "symptoms": data.symptoms
    })

    # =========================================
    # STEP 2 → ML Prediction
    # =========================================

    input_df = pd.DataFrame([{
        "age": features["age"],
        "heart_rate": features["heart_rate"],
        "bp_sys": features["bp_sys"],
        "bp_dia": features["bp_dia"],
        "spo2": features["spo2"],
        "resp_rate": features["resp_rate"],
        "pain_score": features["pain_score"],
        "chest_pain": features["chest_pain"],
        "breathing_issue": features["breathing_issue"],
        "bleeding": features["bleeding"],
        "unconscious": features["unconscious"]
    }])

    prediction = model.predict(input_df)[0]

    labels = {
        0: "LOW",
        1: "MEDIUM",
        2: "CRITICAL"
    }

    severity = labels[prediction]

    # =========================================
    # STEP 3 → Find Nearest Ambulance
    # =========================================

    # Find all available ambulances within 15km radius, sorted by distance
    ambulances_cursor = db.ambulances.find({
        "status": "available",
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [data.lng, data.lat]
                },
                "$maxDistance": 15000  # 15km in meters
            }
        }
    })

    ambulances_list = await ambulances_cursor.to_list(length=10)

    if not ambulances_list:
        # If no available ambulance within 15km, get the nearest available ambulance anywhere.
        ambulances_list = await db.ambulances.find({
            "status": "available",
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [data.lng, data.lat]
                    }
                }
            }
        }).to_list(length=1)

    if not ambulances_list:
        # If still no available ambulance, assign the nearest unit regardless of status.
        ambulances_list = await db.ambulances.find({
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [data.lng, data.lat]
                    }
                }
            }
        }).to_list(length=1)

    if not ambulances_list:
        raise HTTPException(
            status_code=503,
            detail="No ambulance available"
        )

    ambulance = ambulances_list[0]

    # =========================================
    # STEP 4 → Find Best Hospital
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

    if not hospitals:
        raise HTTPException(
            status_code=503,
            detail="No hospital available"
        )

    best_hospital = hospitals[0]

    # =========================================
    # STEP 5 → Fetch Route from ORS
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
    # STEP 6 → Create Incident
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

        "status": "active",

        "route": {
            "distance_km": distance_km,
            "duration_minutes": duration_minutes,
            "polyline": polyline
        }
    }

    result = await db.incidents.insert_one(incident)

    # =========================================
    # STEP 7 → Update Ambulance Status
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
    # STEP 8 → Final Response
    # =========================================

    return {

        "incident_id": str(result.inserted_id),

        "severity": severity,

        "patient_location": {
            "lat": data.lat,
            "lng": data.lng
        },

        "ambulance": {
            "id": str(ambulance["_id"]),
            "name": ambulance["name"],
            "location": {
                "lat": ambulance["location"]["coordinates"][1],
                "lng": ambulance["location"]["coordinates"][0]
            }
        },

        "hospital": {
            "id": str(best_hospital["_id"]),
            "name": best_hospital["name"],
            "location": {
                "lat": best_hospital["location"]["coordinates"][1],
                "lng": best_hospital["location"]["coordinates"][0]
            }
        },

        "route": {
           "distance_km": distance_km,
           "duration_minutes": duration_minutes,
           "polyline": polyline
        }
    }