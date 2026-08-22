import joblib

from department_mapping import CATEGORY_DEPARTMENT_MAP
from recommendation_decision import get_decision

MODEL_PATH = "ml/category_model_calibrated.pkl"

model = joblib.load(MODEL_PATH)


def recommend(text):

    probabilities = model.predict_proba([text])[0]
    classes = model.classes_

    ranked = sorted(
        zip(classes, probabilities),
        key=lambda x: x[1],
        reverse=True
    )

    category, confidence = ranked[0]

    department = CATEGORY_DEPARTMENT_MAP.get(
        category,
        "General Administration"
    )
    decision = get_decision(confidence)

    alternatives = []

    for cat, probability in ranked[:3]:

        alternatives.append({
            "category": cat,
            "confidence": round(
                float(probability),
                4
            ),
            "department":
                CATEGORY_DEPARTMENT_MAP.get(
                    cat,
                    "General Administration"
                )
        })

    return {
    "category": category,
    "department": department,
    "confidence": round(float(confidence), 4),
    "decision": decision,
    "alternatives": alternatives
}


if __name__ == "__main__":

    tests = [
        "street light not working",
        "water pipe leak near house",
        "garbage van not coming",
        "road la pothole iruku"
    ]

    for text in tests:

        print("\n" + "=" * 60)
        print("Complaint:", text)

        result = recommend(text)

        print("Category:",
              result["category"])

        print("Department:",
              result["department"])

        print("Confidence:",
              result["confidence"])

        print("Decision:",
              result["decision"])

        print("\nAlternatives:")

        for item in result["alternatives"]:
            print(
                item["category"],
                "→",
                item["department"],
                f"({item['confidence']:.2%})"
            )