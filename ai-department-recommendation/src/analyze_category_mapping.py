import pandas as pd

INPUT = "data/processed/seed_dataset.csv"

df = pd.read_csv(INPUT)

# Keywords used only to identify candidate subcategories.
# Final labels will be reviewed before training.

rules = {
    "Street Light Issues": [
        "street light",
        "streetlight",
        "street lights",
        "வீதியில் விளக்கு",
        "தெரு விளக்கு",
        "விளக்கு"
    ],

    "Potholes": [
        "pothole",
        "potholes",
        "குழி",
        "குழிகள்"
    ],

    "Bus Services": [
        "bus",
        "பஸ்",
        "பேருந்து"
    ],

    "Public Transport": [
        "transport",
        "போக்குவரத்து"
    ],

    "Garbage Collection": [
        "garbage",
        "குப்பை",
        "garbage collection",
        "garbage truck",
        "garbage van"
    ],

    "Land Records": [
        "patta",
        "land record",
        "land records",
        "survey number",
        "சிட்டா",
        "பட்டா",
        "நிலம்"
    ],

    "Government Hospital Issues": [
        "hospital",
        "மருத்துவமனை",
        "doctor",
        "மருத்துவர்"
    ]
}


def find_candidates(text):
    text = str(text).lower()

    matches = []

    for category, keywords in rules.items():
        for keyword in keywords:
            if keyword.lower() in text:
                matches.append(category)
                break

    return matches


df["candidate_categories"] = df["normalized_text"].apply(find_candidates)

# Only display records where a refinement candidate was detected.
result = df[df["candidate_categories"].str.len() > 0].copy()

print("=" * 70)
print("CATEGORY REFINEMENT CANDIDATES")
print("=" * 70)

for _, row in result.iterrows():
    print("\nID:", row["request_id"])
    print("Text:", row["normalized_text"])
    print("Original:", row["category"])
    print("Candidates:", row["candidate_categories"])

result.to_csv(
    "data/processed/category_candidates.csv",
    index=False
)

print("\nSaved:")
print("data/processed/category_candidates.csv")