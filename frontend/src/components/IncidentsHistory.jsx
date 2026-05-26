import { useEffect, useState } from "react"
import axios from "axios"

function IncidentsHistory() {

  const [incidents, setIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/incidents")
      .then((res) => {
        setIncidents(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    const normalized = searchTerm.toLowerCase();
    return (
      incident.patient_name?.toLowerCase().includes(normalized) ||
      incident.status?.toLowerCase().includes(normalized) ||
      incident.severity?.toLowerCase().includes(normalized)
    );
  });

  return (
    <div className="history-shell">
      <div className="history-header">
        <div>
          <h2>Incident History</h2>
          <p>Review recent patient cases, severity, and live status updates.</p>
        </div>
        <input
          type="text"
          className="history-search"
          placeholder="Search patient, severity, or status"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="history-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncidents.map((i) => (
              <tr key={i._id}>
                <td>{i.patient_name}</td>
                <td>
                  <span className={`severity-pill ${i.severity?.toLowerCase()}`}>
                    {i.severity}
                  </span>
                </td>
                <td>{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IncidentsHistory