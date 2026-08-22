import pandas as pd

MAIN = "data/raw/civicdex_main.csv"
ADAPTED = "data/raw/civicdex_adapted.csv"

main = pd.read_csv(MAIN)
adapted = pd.read_csv(ADAPTED)

main_texts = set(
    main["normalized_text"]
    .fillna("")
    .astype(str)
    .str.strip()
    .str.lower()
)

adapted_texts = (
    adapted["normalized_text"]
    .fillna("")
    .astype(str)
    .str.strip()
    .str.lower()
)

adapted_only = adapted[~adapted_texts.isin(main_texts)]

print("=" * 60)
print("ADAPTED-ONLY RECORDS")
print("=" * 60)

print("Count:", len(adapted_only))

print("\nCategories:")
print(adapted_only["category"].value_counts())

print("\nRecords:")
print(
    adapted_only[
        [
            "request_id",
            "raw_text",
            "normalized_text",
            "language_type",
            "category",
            "department"
        ]
    ].to_string(index=False)
)