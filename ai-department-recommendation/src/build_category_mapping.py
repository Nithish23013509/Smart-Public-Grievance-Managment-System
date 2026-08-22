import pandas as pd

INPUT = "data/processed/seed_dataset.csv"
OUTPUT = "data/processed/category_mapping_review.csv"

df = pd.read_csv(INPUT)


def map_category(row):
    text = str(row["normalized_text"]).lower()
    category = str(row["category"]).lower()

    # ---------------------------------
    # DIRECT MAPPINGS
    # ---------------------------------

    if category == "street_lighting":
        return "Street Light Issues", "high"

    if category == "water_supply":
        return "Drinking Water Supply", "high"

    if category == "drainage":
        return "Drainage and Sewage", "high"

    if category == "electricity":
        return "Electricity Issues", "high"

    # ---------------------------------
    # ROADS
    # ---------------------------------

    if category == "roads":

        if any(word in text for word in [
            "pothole",
            "potholes",
            "குழி",
            "குழிகள்",
            "road hole"
        ]):
            return "Potholes", "high"

        return "Road Damage", "medium"

    # ---------------------------------
    # TRANSPORT
    # ---------------------------------

    if category == "transport":

        if any(word in text for word in [
            "bus",
            "பஸ்",
            "பேருந்து"
        ]):
            return "Bus Services", "high"

        return "Public Transport", "medium"

    # ---------------------------------
    # CERTIFICATES
    # ---------------------------------

    if category == "certificates":

        if any(word in text for word in [
            "patta",
            "land record",
            "survey number",
            "சிட்டா",
            "பட்டா",
            "நிலம்"
        ]):
            return "Land Records", "medium"

        return "Revenue Services", "low"

    # ---------------------------------
    # SANITATION
    # ---------------------------------

    if category == "sanitation":

        if any(word in text for word in [
            "garbage",
            "குப்பை",
            "waste",
            "trash",
            "garbage collection",
            "garbage truck",
            "garbage van"
        ]):
            return "Garbage Collection", "high"

        return "Public Health", "medium"

    # ---------------------------------
    # PUBLIC HEALTH
    # ---------------------------------

    if category == "public_health":

        if any(word in text for word in [
            "hospital",
            "மருத்துவமனை",
            "doctor",
            "மருத்துவர்",
            "medical"
        ]):
            return "Government Hospital Issues", "high"

        return "Public Health", "medium"

    # ---------------------------------
    # WELFARE
    # ---------------------------------

    if category == "welfare":

        if any(word in text for word in [
            "women",
            "woman",
            "child",
            "children",
            "பெண்கள்",
            "குழந்தை",
            "குழந்தைகள்"
        ]):
            return "Women and Child Welfare", "medium"

        return "Welfare Scheme Issues", "medium"

    # ---------------------------------
    # UNKNOWN
    # ---------------------------------

    return "REVIEW_REQUIRED", "unknown"


mapped = df.apply(map_category, axis=1)

df["suggested_category"] = mapped.apply(lambda x: x[0])
df["mapping_confidence"] = mapped.apply(lambda x: x[1])

df["review_status"] = df["suggested_category"].apply(
    lambda x: "review"
    if x == "REVIEW_REQUIRED"
    else "candidate"
)

columns = [
    "request_id",
    "raw_text",
    "normalized_text",
    "english_gloss",
    "language_type",
    "intent",
    "category",
    "department",
    "urgency",
    "severity",
    "suggested_category",
    "mapping_confidence",
    "review_status"
]

df[columns].to_csv(OUTPUT, index=False)

print("=" * 60)
print("CATEGORY MAPPING CREATED")
print("=" * 60)

print("Rows:", len(df))

print("\nSuggested categories:")
print(df["suggested_category"].value_counts())

print("\nReview status:")
print(df["review_status"].value_counts())

print("\nSaved:")
print(OUTPUT)