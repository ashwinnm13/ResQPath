import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup
} from "react-leaflet"

import L from "leaflet"
import "leaflet/dist/leaflet.css"

const patientIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="marker-blob marker-patient"><span>+</span></div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -38]
});

const ambulanceIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="marker-blob marker-ambulance"><span>🚑</span></div>`,
  iconSize: [46, 46],
  iconAnchor: [23, 46],
  popupAnchor: [0, -40],
})

const hospitalIcon = L.divIcon({
  className: "custom-div-icon",
  html: `<div class="marker-blob marker-hospital"><span>🏥</span></div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -38]
});

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

function MapView({ dispatchData, liveData }) {
  if (!dispatchData) {
    return (
      <div className="map-placeholder glass-card">
        <div className="map-placeholder-inner">
          <h2>Operational Map</h2>
          <p>Dispatch an incident to display the live ambulance route and patient location.</p>
        </div>
      </div>
    );
  }

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
    <div className="map-card">
      <MapContainer center={callerPosition} zoom={14} className="dashboard-map">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={callerPosition} icon={patientIcon}>
          <Popup>
            <strong>Patient Location</strong>
            <br />
            Lat: {callerPosition[0].toFixed(4)}
            <br />
            Lng: {callerPosition[1].toFixed(4)}
          </Popup>
        </Marker>

        <Marker position={ambulancePosition} icon={ambulanceIcon}>
          <Popup>
            <strong>Ambulance</strong>
            <br />
            Status: {liveData?.status || "EN_ROUTE"}
            <br />
            Lat: {ambulancePosition[0].toFixed(4)}
            <br />
            Lng: {ambulancePosition[1].toFixed(4)}
          </Popup>
        </Marker>

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

        {polyline.length > 0 && (
          <>
            <Polyline positions={polyline} pathOptions={{ color: "rgba(2,195,154,0.18)", weight: 14, opacity: 0.7 }} />
            <Polyline positions={polyline} pathOptions={{ color: "#02c39a", weight: 6, dashArray: "10,8" }} />
          </>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView