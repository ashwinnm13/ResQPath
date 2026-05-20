import React from 'react';


function DispatchCard({ dispatchData }) {

  if (!dispatchData) {
    return <div>No dispatch yet</div>;
  }

  return (

    <div>

      <h2>Dispatch Result</h2>

      <p>
        Severity:
        {dispatchData.severity}
      </p>

      <p>
        Ambulance:
        {dispatchData.ambulance.name}
      </p>

      <p>
        Hospital:
        {dispatchData.hospital.name}
      </p>

      <p>
        ETA:
        {dispatchData.route.duration_minutes} mins
      </p>

      <p>
        Distance:
        {dispatchData.route.distance_km} km
      </p>

    </div>
  );
}

export default DispatchCard;