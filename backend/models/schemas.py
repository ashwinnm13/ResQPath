from pydantic import BaseModel
from typing import List

class AmbulanceResponse(BaseModel):
    name: str
    status: str

class HospitalResponse(BaseModel):
    name: str
    beds: int
    occupancy_rate: int