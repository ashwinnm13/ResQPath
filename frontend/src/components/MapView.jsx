import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup
} from "react-leaflet"

import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Custom marker icons with different colors and symbols
const createCustomIcon = (color, symbol) => {
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
    <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="12" y="16" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${symbol}</text>
  </svg>`

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgIcon)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

const patientIcon = createCustomIcon("#EF4444", "P")      // Red for Patient
const ambulanceIcon = createCustomIcon("#3B82F6", "A")     // Blue for Ambulance
const hospitalIcon = createCustomIcon("#10B981", "H")      // Green for Hospital

// Decode ORS polyline
function decodePolyline(encoded) {

  let points = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {

    let b
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    let dlat =
      (result & 1)
        ? ~(result >> 1)
        : (result >> 1)

    lat += dlat

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    let dlng =
      (result & 1)
        ? ~(result >> 1)
        : (result >> 1)

    lng += dlng

    points.push([
      lat / 1e5,
      lng / 1e5
    ])
  }

  return points
}

function MapView({
  dispatchData,
  liveData
}) {

  if (!dispatchData) {
    return <div>Map View</div>
  }

  // Patient position
  const callerPosition = [
    dispatchData.patient_location.lat,
    dispatchData.patient_location.lng
  ]

  // Hospital position
  const hospitalPosition = [
    dispatchData.hospital.location.lat,
    dispatchData.hospital.location.lng
  ]

  // LIVE ambulance movement
  const ambulancePosition = liveData
    ? [
        liveData.ambulance_location.lat,
        liveData.ambulance_location.lng
      ]
    : [
        dispatchData.ambulance.location.lat,
        dispatchData.ambulance.location.lng
      ]

  // Decode route polyline
  let polyline = []

  if (
    dispatchData.route?.polyline &&
    typeof dispatchData.route.polyline === "string" &&
    dispatchData.route.polyline !== "Route unavailable"
  ) {

    polyline = decodePolyline(
      dispatchData.route.polyline
    )
  }

  return (

    <MapContainer
      center={callerPosition}
      zoom={14}
      style={{
        height: "500px",
        width: "100%",
        marginTop: "20px"
      }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Patient Marker */}
      <Marker position={callerPosition} icon={patientIcon}>
        <Popup>
          <strong>Patient Location</strong>
          <br />
          Lat: {callerPosition[0].toFixed(4)}
          <br />
          Lng: {callerPosition[1].toFixed(4)}
        </Popup>
      </Marker>

      {/* Live Ambulance Marker */}
      <Marker position={ambulancePosition} icon={ambulanceIcon}>
        <Popup>
          <strong>🚑 Ambulance</strong>
          <br />
          Status: {liveData?.status || "EN_ROUTE"}
          <br />
          Lat: {ambulancePosition[0].toFixed(4)}
          <br />
          Lng: {ambulancePosition[1].toFixed(4)}
        </Popup>
      </Marker>

      {/* Hospital Marker */}
      <Marker position={hospitalPosition} icon={hospitalIcon}>
        <Popup>
          <strong>Hospital</strong>
          <br />
          {dispatchData.hospital.name}
          <br />
          Lat: {hospitalPosition[0].toFixed(4)}
          <br />
          Lng: {hospitalPosition[1].toFixed(4)}
        </Popup>
      </Marker>

      {/* Route */}
      {
        polyline.length > 0 &&
        (
          <Polyline positions={polyline} />
        )
      }

    </MapContainer>
  )
}

export default MapView