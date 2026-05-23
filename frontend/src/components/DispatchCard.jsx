import React from "react"

function DispatchCard({
  dispatchData,
  liveData
}) {

  if (!dispatchData) {
    return <div>No dispatch yet</div>
  }

  const severityColors = {
  LOW: "green",
  MEDIUM: "orange",
  CRITICAL: "red"
}

  const status =
    liveData?.status || "EN_ROUTE"

  return (

    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid gray",
        borderRadius: "10px"
      }}
    >

      <h2>Dispatch Result</h2>

      <h3>
        Status:
        {status}
      </h3>

      <p
       style={{
       color:
        severityColors[
         dispatchData.severity
      ]
  }}
      
      >
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
        {dispatchData.route.duration_minutes}
        mins
      </p>

      <p>
        Distance:
        {dispatchData.route.distance_km}
        km
      </p>

    </div>
  )
}

export default DispatchCard