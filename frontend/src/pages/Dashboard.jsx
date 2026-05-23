import { useState } from "react";

import EmergencyForm from "../components/EmergencyForm";
import MapView from "../components/MapView";
import DispatchCard from "../components/DispatchCard";
import useWebSocket from "../hooks/useWebSocket";
import IncidentsHistory from "../components/IncidentsHistory";


function Dashboard() {

  const [dispatchData, setDispatchData] = useState(null);
  const [liveData, setLiveData] = useState(null);

  useWebSocket(
    dispatchData ? dispatchData.incident_id : null,
    setLiveData
  );

  return (

    <div>

      <h1>ResQPath Dashboard</h1>

      <EmergencyForm setDispatchData={setDispatchData}/>

      <MapView dispatchData={dispatchData} liveData={liveData} />

      <DispatchCard dispatchData={dispatchData} liveData={liveData} />

      <IncidentsHistory />

    </div>
  );
}

export default Dashboard;