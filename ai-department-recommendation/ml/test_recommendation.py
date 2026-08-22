import joblib

MODEL_PATH = "ml/category_model.pkl"

model = joblib.load(MODEL_PATH)

while True:

    text = input("\nEnter complaint (or 'exit'): ")

    if text.lower() == "exit":
        break

    probabilities = model.predict_proba([text])[0]
    classes = model.classes_

    ranked = sorted(
        zip(classes, probabilities),
        key=lambda x: x[1],
        reverse=True
    )

    print("\nRecommendations:")
    print("-" * 40)

    for category, probability in ranked[:3]:
        print(
            f"{category:<30} "
            f"{probability * 100:.2f}%"
        )

    category, confidence = ranked[0]

    print("\nBEST RECOMMENDATION")
    print("Category   :", category)
    print("Confidence :", f"{confidence * 100:.2f}%")