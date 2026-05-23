import { useEffect, useState } from "react"
import axios from "axios"

function IncidentsHistory() {

  const [incidents, setIncidents] =
    useState([])

  useEffect(() => {

    axios
      .get("http://127.0.0.1:8000/incidents")
      .then((res) => {

        setIncidents(res.data)

      })
      .catch((err) => {
        console.log(err)
      })

  }, [])

  return (

    <div
      style={{
        marginTop: "30px"
      }}
    >

      <h2>
        Incident History
      </h2>

      <table
        border="1"
        cellPadding="10"
      >

        <thead>

          <tr>
            <th>Patient</th>
            <th>Severity</th>
            <th>Status</th>
          </tr>

        </thead>

        <tbody>

          {
            incidents.map((i) => (

              <tr key={i._id}>

                <td>
                  {i.patient_name}
                </td>

                <td>
                  {i.severity}
                </td>

                <td>
                  {i.status}
                </td>

              </tr>
            ))
          }

        </tbody>

      </table>

    </div>
  )
}

export default IncidentsHistory