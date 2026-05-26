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
    symptoms: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const symptomsList = [
    { key: "chest_pain", label: "Chest Pain" },
    { key: "breathing_issue", label: "Breathing Issue" },
    { key: "bleeding", label: "Bleeding" },
    { key: "unconscious", label: "Unconscious" }
  ];

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
        setLocationStatus("Allow location access — location required to dispatch.");
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
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const lat = userLocation.lat;
      const lng = userLocation.lng;

      if (lat == null || lng == null) {
        setErrorMessage("Please allow location access to dispatch an ambulance.");
        setIsSubmitting(false);
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

      setDispatchData({ ...response.data, patient_location: { lat, lng } });
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      const backendDetail = error.response?.data?.detail;
      setErrorMessage(backendDetail || error.message || "Dispatch failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-shell">
      <div className="form-header">
        <p className="eyebrow">Patient Intake</p>
        <h2>Dispatch Emergency Response</h2>
        <p className="form-subtitle">Complete the medical triage form and deploy the nearest ambulance.</p>
      </div>

      <form onSubmit={handleSubmit} className="emergency-form">
        <div className="field-row">
          <label className="field-label" htmlFor="patient_name">
            Patient Name
          </label>
          <div className="field-input-with-icon">
            <span className="input-icon">👤</span>
            <input
              id="patient_name"
              type="text"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              placeholder="Enter patient name"
              required
            />
          </div>
        </div>

        <div className="field-row two-column">
          <div>
            <label className="field-label" htmlFor="age">
              Age
            </label>
            <div className="field-input-with-icon">
              <span className="input-icon">🧬</span>
              <input
                id="age"
                type="number"
                name="age"
                min="0"
                max="150"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                required
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="pain_score">
              Pain Score
            </label>
            <div className="range-block">
              <input
                id="pain_score"
                type="range"
                name="pain_score"
                min="1"
                max="10"
                value={formData.pain_score}
                onChange={handleChange}
              />
              <span className="range-value">{formData.pain_score}</span>
            </div>
          </div>
        </div>

        <div className="field-row">
          <label className="field-label">Symptoms</label>
          <div className="symptom-grid">
            {symptomsList.map((symptom) => (
              <button
                type="button"
                key={symptom.key}
                className={`pill-checkbox ${formData.symptoms.includes(symptom.key) ? "pill-active" : ""}`}
                onClick={() => handleSymptomChange(symptom.key)}
              >
                {symptom.label}
              </button>
            ))}
          </div>
        </div>

        <div className="location-card">
          <div>
            <p className="field-label">Dispatch Location</p>
            <p className="location-status">{locationStatus || "Using your current location."}</p>
          </div>
          <div className="location-data">
            {userLocation.lat != null && userLocation.lng != null ? (
              <span>{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
            ) : (
              <span className="location-muted">Waiting for location authorization...</span>
            )}
          </div>
        </div>

        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="button-spinner" /> : "Dispatch Ambulance"}
        </button>

        {errorMessage && <div className="form-error">{errorMessage}</div>}
      </form>
    </div>
  );
}

export default EmergencyForm;