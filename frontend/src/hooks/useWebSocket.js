import { useEffect } from "react"

function useWebSocket(
  incidentId,
  setLiveData
) {

  useEffect(() => {

    if (!incidentId) return

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/incidents/${incidentId}`
    )

    ws.onmessage = (event) => {

      const data = JSON.parse(event.data)

      console.log(data)

      setLiveData(data)
    }

   ws.onclose = () => {

  console.log(
    "WebSocket disconnected"
  )

  setTimeout(() => {

    window.location.reload()

  }, 3000)
}

    return () => {
      ws.close()
    }

  }, [incidentId])

}

export default useWebSocket