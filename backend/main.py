from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import hospital, ambulance ,incident , route , predict

from db import db

app = FastAPI()
app.include_router(hospital.router)
app.include_router(ambulance.router)
app.include_router(incident.router) 
app.include_router(route.router)
app.include_router(predict.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ambulances")
async def get_ambulances():
    ambulances = await db.ambulances.find({}, {"_id": 0}).to_list(length=100)
    return ambulances