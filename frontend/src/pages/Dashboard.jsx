import axios from "axios"
import { useEffect, useState } from "react"

function Dashboard() {
  const [ambulances, setAmbulances] = useState([])

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/ambulances")
      .then((res) => {
        setAmbulances(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <div>
      <h1>Ambulances</h1>

      {ambulances.map((a, index) => (
        <div key={index}>
          {a.name}
        </div>
      ))}
    </div>
  )
}

export default Dashboard