import joblib

MODEL_PATH = "ml/category_model_calibrated.pkl"

model = joblib.load(MODEL_PATH)

tests = [
    "street light not working",
    "street light night la work aagala",
    "குப்பை வண்டி வரவில்லை",
    "water pipe leak near house",
    "road la pothole iruku",
    "குடிநீர் வரவில்லை"
]

for text in tests:

    probabilities = model.predict_proba([text])[0]
    classes = model.classes_

    ranked = sorted(
        zip(classes, probabilities),
        key=lambda x: x[1],
        reverse=True
    )

    print("\n" + "=" * 55)
    print("Complaint:", text)
    print("-" * 55)

    for category, probability in ranked[:3]:
        print(f"{category:<25} {probability * 100:.2f}%")

    category, confidence = ranked[0]

    print("\nBEST RECOMMENDATION")
    print("Category   :", category)
    print("Confidence :", f"{confidence * 100:.2f}%")