from fastapi import APIRouter, WebSocket
from db import db
from bson import ObjectId
import asyncio
import math

router = APIRouter()

def haversine(lat1, lon1, lat2, lon2):
    radius_km = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


def compute_remaining_route(total_distance, total_duration, current_step, total_steps):
    if total_steps <= 0 or total_distance == 0:
        return 0.0, 0.0

    remaining_fraction = max(0, (total_steps - current_step) / total_steps)
    remaining_distance = round(total_distance * remaining_fraction, 2)
    remaining_duration = round(total_duration * remaining_fraction, 2)
    return remaining_distance, remaining_duration


def decodePolyline(encoded):
    """Decode ORS polyline to list of coordinates"""
    points = []
    index = 0
    lat = 0
    lng = 0

    while index < len(encoded):
        b = 0
        shift = 0
        result = 0

        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break

        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat

        b = 0
        shift = 0
        result = 0

        while True:
            b = ord(encoded[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20:
                break

        dlng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += dlng

        points.append([lat / 1e5, lng / 1e5])

    return points

@router.websocket("/ws/incidents/{incident_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    incident_id: str
):

    await websocket.accept()

    try:
        # Fetch incident data from database
        incident = await db.incidents.find_one({
            "_id": ObjectId(incident_id)
        })

        if not incident:
            await websocket.close()
            return

        # Fetch ambulance data
        ambulance = await db.ambulances.find_one({
            "_id": incident["ambulance_id"]
        })

        # Get patient location from incident
        patient_lat = incident["location"]["coordinates"][1]
        patient_lng = incident["location"]["coordinates"][0]

        # Get ambulance starting location
        ambulance_lat = ambulance["location"]["coordinates"][1]
        ambulance_lng = ambulance["location"]["coordinates"][0]

        # Determine route metrics for remaining distance/time
        total_distance_km = float(incident.get("route", {}).get("distance_km") or haversine(ambulance_lat, ambulance_lng, patient_lat, patient_lng))
        total_duration_minutes = float(incident.get("route", {}).get("duration_minutes") or (total_distance_km / 40) * 60)

        # Generate route waypoints from ambulance to patient
        # Simple linear interpolation between ambulance and patient location
        steps = 10
        
        waypoints = []
        for i in range(steps + 1):
            t = i / steps
            lat = ambulance_lat + (patient_lat - ambulance_lat) * t
            lng = ambulance_lng + (patient_lng - ambulance_lng) * t
            waypoints.append([lat, lng])

        # Status progression
        statuses = []
        # 60% EN_ROUTE
        en_route_count = int((steps + 1) * 0.6)
        statuses.extend(["EN_ROUTE"] * en_route_count)
        
        # 30% APPROACHING
        approaching_count = int((steps + 1) * 0.3)
        statuses.extend(["APPROACHING"] * approaching_count)
        
        # 10% ARRIVED
        arrived_count = (steps + 1) - en_route_count - approaching_count
        statuses.extend(["ARRIVED"] * arrived_count)

        # Stream ambulance movement
        for i in range(len(waypoints)):
            remaining_distance, remaining_duration = compute_remaining_route(
                total_distance_km,
                total_duration_minutes,
                i,
                steps
            )

            data = {
                "incident_id": incident_id,
                "ambulance_location": {
                    "lat": waypoints[i][0],
                    "lng": waypoints[i][1]
                },
                "status": statuses[i],
                "route": {
                    "distance_km": remaining_distance,
                    "duration_minutes": remaining_duration
                }
            }

            await websocket.send_json(data)
            
            # Simulate realistic movement timing
            # ~5 seconds per waypoint for smooth movement
            await asyncio.sleep(5)

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()