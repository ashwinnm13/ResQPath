import { useState, useEffect } from "react";
import api from "../services/api";

function EmergencyForm({ setDispatchData }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [locationStatus, setLocationStatus] = useState("Finding your location...");
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    pain_score: 5,
    symptoms: [],
    lat: "",
    lng: ""
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported. Enter location manually.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus("");
      },
      () => {
        setLocationStatus("Allow location access or enter latitude/longitude manually.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSymptomChange = (symptom) => {

    setFormData({
      ...formData,
      symptoms: formData.symptoms.includes(symptom)
        ? formData.symptoms.filter(s => s !== symptom)
        : [...formData.symptoms, symptom]
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const lat = userLocation.lat ?? Number(formData.lat);
      const lng = userLocation.lng ?? Number(formData.lng);

      if (!lat || !lng) {
        setErrorMessage("Please allow location access or enter your coordinates.");
        return;
      }

      const response = await api.post("/dispatch", {
        patient_name: formData.patient_name,
        age: Number(formData.age),
        pain_score: Number(formData.pain_score),
        symptoms: formData.symptoms,
        lat,
        lng
      });

      console.log(response.data);
      setDispatchData({ ...response.data, patient_location: { lat, lng } });
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      const backendDetail = error.response?.data?.detail;
      setErrorMessage(backendDetail || error.message || "Dispatch failed.");
    }
  };

  return (

    <form onSubmit={handleSubmit}>

      <input
        type="text"
        name="patient_name"
        placeholder="Patient Name"
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="age"
        placeholder="Age"
        onChange={handleChange}
        min="0"
        max="150"
        required
      />

      <div>
        <label>Pain Score (1-10):</label>
        <input
          type="range"
          name="pain_score"
          min="1"
          max="10"
          value={formData.pain_score}
          onChange={handleChange}
        />
        <span>{formData.pain_score}</span>
      </div>

      <div>
        <label>Symptoms:</label>
        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.symptoms.includes("chest_pain")}
              onChange={() => handleSymptomChange("chest_pain")}
            />
            Chest Pain
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.symptoms.includes("breathing_issue")}
              onChange={() => handleSymptomChange("breathing_issue")}
            />
            Breathing Issue
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.symptoms.includes("bleeding")}
              onChange={() => handleSymptomChange("bleeding")}
            />
            Bleeding
          </label>
          <label>
            <input
              type="checkbox"
              checked={formData.symptoms.includes("unconscious")}
              onChange={() => handleSymptomChange("unconscious")}
            />
            Unconscious
          </label>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <p>{locationStatus || "Using your current location."}</p>
        <label>
          Latitude:
          <input
            type="number"
            name="lat"
            value={formData.lat}
            onChange={handleChange}
            placeholder={userLocation.lat?.toString() || "Latitude"}
            step="0.000001"
          />
        </label>
        <label>
          Longitude:
          <input
            type="number"
            name="lng"
            value={formData.lng}
            onChange={handleChange}
            placeholder={userLocation.lng?.toString() || "Longitude"}
            step="0.000001"
          />
        </label>
      </div>

      <button type="submit">
        Dispatch Ambulance
      </button>

      {errorMessage && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          {errorMessage}
        </div>
      )}

    </form>
  );
}

export default EmergencyForm;