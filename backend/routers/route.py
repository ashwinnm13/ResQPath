import httpx
from fastapi import APIRouter
from dotenv import load_dotenv
import os

load_dotenv()

router = APIRouter()

API_KEY = os.getenv("ORS_API_KEY")

@router.get("/route")
async def get_route(
    from_lat: float,
    from_lng: float,
    to_lat: float,
    to_lng: float
):

    url = "https://api.openrouteservice.org/v2/directions/driving-car"

    body = {
        "coordinates": [
            [from_lng, from_lat],
            [to_lng, to_lat]
        ]
    }

    headers = {
        "Authorization": API_KEY,
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:

        response = await client.post(
            url,
            json=body,
            headers=headers
        )

    return response.json()