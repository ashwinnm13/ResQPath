import { useState } from "react";

import EmergencyForm from "../components/EmergencyForm";
import MapView from "../components/MapView";
import DispatchCard from "../components/DispatchCard";

function Dashboard() {

  const [dispatchData, setDispatchData] = useState(null);

  return (

    <div>

      <h1>ResQPath Dashboard</h1>

      <EmergencyForm
        setDispatchData={setDispatchData}
      />

      <MapView dispatchData={dispatchData} />

      <DispatchCard dispatchData={dispatchData} />

    </div>
  );
}

export default Dashboard;