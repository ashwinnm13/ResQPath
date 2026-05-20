
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function decodePolyline(encoded) {

  let points = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {

    let b, shift = 0, result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

function MapView({ dispatchData }) {

  if (!dispatchData) {
    return <div>Map View</div>;
  }

  const callerPosition = [
    dispatchData.patient_location.lat,
    dispatchData.patient_location.lng
  ];

  const hospitalPosition = [
    dispatchData.hospital.location.lat,
    dispatchData.hospital.location.lng
  ];

  const ambulancePosition = [
    dispatchData.ambulance.location.lat,
    dispatchData.ambulance.location.lng
  ];

  let polyline = [];

  if (
    dispatchData.route?.polyline &&
    typeof dispatchData.route.polyline === "string" &&
    dispatchData.route.polyline !== "Route unavailable"
  ) {
    polyline = decodePolyline(dispatchData.route.polyline);
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

      <Marker position={callerPosition}>
        <Popup>
          Patient Location
        </Popup>
      </Marker>

      <Marker position={ambulancePosition}>
        <Popup>
          Ambulance
        </Popup>
      </Marker>

      <Marker position={hospitalPosition}>
        <Popup>
          Hospital
        </Popup>
      </Marker>

      {polyline.length > 0 && <Polyline positions={polyline} />}

    </MapContainer>
  );
}

export default MapView;