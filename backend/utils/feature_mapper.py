def map_symptoms_to_features(data):
    """
    Maps user symptoms to estimated vital signs for ML model prediction.
    Starts with baseline vitals and adjusts based on reported symptoms.
    """

    symptoms = data["symptoms"]

    # Baseline vital signs
    heart_rate = 80
    bp_sys = 120
    bp_dia = 80
    spo2 = 98
    resp_rate = 16

    # Adjust vitals based on symptoms
    if "chest_pain" in symptoms:
        heart_rate += 30
        bp_sys += 30

    if "breathing_issue" in symptoms:
        spo2 -= 16
        resp_rate += 12

    if "bleeding" in symptoms:
        bp_sys -= 20
        heart_rate += 20

    if "unconscious" in symptoms:
        spo2 -= 20
        heart_rate += 40
        resp_rate += 10

    return {
        "age": data["age"],
        "heart_rate": heart_rate,
        "bp_sys": bp_sys,
        "bp_dia": bp_dia,
        "spo2": spo2,
        "resp_rate": resp_rate,
        "pain_score": data["pain_score"],
        "chest_pain": 1 if "chest_pain" in symptoms else 0,
        "breathing_issue": 1 if "breathing_issue" in symptoms else 0,
        "bleeding": 1 if "bleeding" in symptoms else 0,
        "unconscious": 1 if "unconscious" in symptoms else 0
    }
