import numpy as np
import pandas as pd

np.random.seed(42)

rows = 1000

data = {
    "age": np.random.randint(1, 90, rows),

    "heart_rate": np.random.randint(55, 180, rows),

    "bp_sys": np.random.randint(80, 200, rows),

    "bp_dia": np.random.randint(50, 130, rows),

    "spo2": np.random.randint(70, 100, rows),

    "resp_rate": np.random.randint(10, 40, rows),

    "pain_score": np.random.randint(0, 10, rows),

    # Binary symptoms
    "chest_pain": np.random.randint(0, 2, rows),

    "breathing_issue": np.random.randint(0, 2, rows),

    "bleeding": np.random.randint(0, 2, rows),

    "unconscious": np.random.randint(0, 2, rows),
}

df = pd.DataFrame(data)

# Create severity labels
severity = []

for _, row in df.iterrows():

    score = 0

    if row["heart_rate"] > 130:
        score += 2

    if row["spo2"] < 85:
        score += 3

    if row["bp_sys"] > 170:
        score += 2

    if row["pain_score"] > 7:
        score += 2

    if row["unconscious"] == 1:
        score += 4

    if row["breathing_issue"] == 1:
        score += 2

    # Assign labels
    if score >= 7:
        severity.append(2)   # CRITICAL

    elif score >= 4:
        severity.append(1)   # MEDIUM

    else:
        severity.append(0)   # LOW

df["severity"] = severity

# Save CSV
df.to_csv("cd ", index=False)

print(df.head())

print("\nDataset saved successfully.")