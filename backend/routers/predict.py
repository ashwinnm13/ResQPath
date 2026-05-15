from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import pandas as pd

router = APIRouter()

# Load trained model
model = joblib.load("ml/model.pkl")


# Request schema
class PredictRequest(BaseModel):

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


# Prediction endpoint
@router.post("/predict")
async def predict_severity(data: PredictRequest):

    input_data = pd.DataFrame([data.dict()])

    prediction = model.predict(input_data)[0]

    probabilities = model.predict_proba(input_data)[0]

    confidence = round(float(max(probabilities)), 2)

    labels = {
        0: "LOW",
        1: "MEDIUM",
        2: "CRITICAL"
    }

    return {
        "severity": labels[prediction],
        "confidence": confidence
    }