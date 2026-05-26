import { useState } from "react";

import EmergencyForm from "../components/EmergencyForm";
import MapView from "../components/MapView";
import DispatchCard from "../components/DispatchCard";
import useWebSocket from "../hooks/useWebSocket";
import IncidentsHistory from "../components/IncidentsHistory";
import Logo from "../../assets/logo.svg";

function Dashboard() {
  const [dispatchData, setDispatchData] = useState(null);
  const [liveData, setLiveData] = useState(null);

  useWebSocket(dispatchData ? dispatchData.incident_id : null, setLiveData);

  const liveStatus = dispatchData ? (liveData?.status || "EN_ROUTE") : "SYSTEM READY";
  const routeDistance = liveData?.route?.distance_km ?? dispatchData?.route?.distance_km;
  const routeDuration = liveData?.route?.duration_minutes ?? dispatchData?.route?.duration_minutes;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="brand-block">
          <img src={Logo} alt="ResQPath logo" className="brand-logo" />
          <p className="brand-tag">Medical Emergency Operations</p>
        </div>

        <div className="sidebar-section">
          <h2 className="sidebar-title">Operations Snapshot</h2>
          <div className="sidebar-metric">
            <span>Active Incidents</span>
            <strong>{dispatchData ? 1 : 0}</strong>
          </div>
          <div className="sidebar-metric">
            <span>Assigned Ambulance</span>
            <strong>{dispatchData?.ambulance?.name || "Awaiting"}</strong>
          </div>
          <div className="sidebar-metric">
            <span>Destination Hospital</span>
            <strong>{dispatchData?.hospital?.name || "Awaiting"}</strong>
          </div>
        </div>

        <div className="sidebar-footer">
          <p className="sidebar-footer-title">System Status</p>
          <span className={`sidebar-status ${liveStatus === "EN_ROUTE" ? "status-warning" : liveStatus === "ARRIVED" ? "status-success" : "status-neutral"}`}>
            {liveStatus.replaceAll("_", " ")}
          </span>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">Operations Center</p>
            <h1>Emergency Dispatch Dashboard</h1>
          </div>
          <div className="topbar-pill">Premium triage and response coordination</div>
        </header>

        <section className="dashboard-summary-grid">
          <div className="status-card glass-card">
            <span className="status-card-label">Live Response</span>
            <strong>{liveStatus.replaceAll("_", " ")}</strong>
          </div>
          <div className="status-card glass-card">
            <span className="status-card-label">Ambulance</span>
            <strong>{dispatchData?.ambulance?.name || "Idle"}</strong>
          </div>
          <div className="status-card glass-card">
            <span className="status-card-label">Hospital</span>
            <strong>{dispatchData?.hospital?.name || "Pending"}</strong>
          </div>
          <div className="status-card glass-card">
            <span className="status-card-label">Route ETA</span>
            <strong>{routeDuration ? `${routeDuration} min` : "N/A"}</strong>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel panel-large glass-card">
            <EmergencyForm setDispatchData={setDispatchData} />
          </div>

          <div className="panel panel-large glass-card">
            <MapView dispatchData={dispatchData} liveData={liveData} />
          </div>

          <div className="panel glass-card">
            <DispatchCard dispatchData={dispatchData} liveData={liveData} />
          </div>

          <div className="panel panel-full glass-card">
            <IncidentsHistory />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;