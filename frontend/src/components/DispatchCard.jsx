import React from "react"

function DispatchCard({ dispatchData, liveData }) {
  if (!dispatchData) {
    return (
      <div className="empty-card">
        <h2>Dispatch Widget</h2>
        <p>No active dispatch yet. Submit the triage form to begin response coordination.</p>
      </div>
    );
  }

  const status = liveData?.status || "EN_ROUTE";
  const severityClass = dispatchData.severity?.toLowerCase();
  const routeDistance = liveData?.route?.distance_km ?? dispatchData.route?.distance_km;
  const routeDuration = liveData?.route?.duration_minutes ?? dispatchData.route?.duration_minutes;

  return (
    <div className="dispatch-card-card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Active Response</p>
          <h2>Dispatch Overview</h2>
        </div>
        <div className={`status-pill ${status.toLowerCase()}`}>
          {status.replaceAll("_", " ")}
        </div>
      </div>

      <div className="dispatch-badges">
        <span className={`severity-badge ${severityClass}`}>{dispatchData.severity}</span>
        <span className="eta-badge">ETA {routeDuration ?? "N/A"} min</span>
      </div>

      <div className="dispatch-details">
        <div className="detail-block">
          <p className="detail-title">Ambulance</p>
          <p className="detail-value">{dispatchData.ambulance.name}</p>
          <p className="detail-meta">Responding unit ready for patient pickup</p>
        </div>
        <div className="detail-block">
          <p className="detail-title">Hospital</p>
          <p className="detail-value">{dispatchData.hospital.name}</p>
          <p className="detail-meta">Destination facility assigned</p>
        </div>
      </div>

      <div className="route-metrics">
        <div>
          <span>Distance</span>
          <strong>{routeDistance ?? "N/A"} km</strong>
        </div>
        <div>
          <span>Estimated Time</span>
          <strong>{routeDuration ?? "N/A"} min</strong>
        </div>
      </div>
    </div>
  );
}

export default DispatchCard