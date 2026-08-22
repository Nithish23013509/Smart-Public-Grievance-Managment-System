import pandas as pd

INPUT = "data/processed/seed_dataset.csv"

df = pd.read_csv(INPUT)

for category in sorted(df["category"].dropna().unique()):

    subset = df[df["category"] == category]

    print("\n" + "=" * 70)
    print(f"CATEGORY: {category}")
    print(f"COUNT: {len(subset)}")
    print("=" * 70)

    for _, row in subset.head(15).iterrows():
        print(
            f'{row["request_id"]} | '
            f'{row["language_type"]} | '
            f'{row["normalized_text"]}'
        )