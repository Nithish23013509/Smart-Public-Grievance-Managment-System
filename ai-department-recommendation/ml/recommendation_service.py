import joblib

from recommendation_decision import get_decision

CATEGORY_MODEL_PATH = "ml/category_model_calibrated.pkl"
DEPARTMENT_MODEL_PATH = "ml/department_model_calibrated.pkl"

category_model = joblib.load(CATEGORY_MODEL_PATH)
department_model = joblib.load(DEPARTMENT_MODEL_PATH)


def recommend(text):
    # Predict Category
    cat_probs = category_model.predict_proba([text])[0]
    cat_classes = category_model.classes_
    cat_ranked = sorted(
        zip(cat_classes, cat_probs),
        key=lambda x: x[1],
        reverse=True
    )

    # Predict Department
    dept_probs = department_model.predict_proba([text])[0]
    dept_classes = department_model.classes_
    dept_ranked = sorted(
        zip(dept_classes, dept_probs),
        key=lambda x: x[1],
        reverse=True
    )

    category, cat_conf = cat_ranked[0]
    department, dept_conf = dept_ranked[0]

    # Overall confidence is the minimum of both, ensuring conservative auto-routing
    confidence = min(cat_conf, dept_conf)
    decision = get_decision(confidence)

    alternatives = []

    for i in range(3):
        cat, cat_p = cat_ranked[i]
        dept, dept_p = dept_ranked[i]
        
        alternatives.append({
            "category": cat,
            "department": dept,
            "confidence": round(float(min(cat_p, dept_p)), 4)
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
                "->",
                item["department"],
                f"({item['confidence']:.2%})"
            )