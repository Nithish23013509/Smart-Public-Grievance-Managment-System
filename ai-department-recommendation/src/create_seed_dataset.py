import pandas as pd

INPUT = "data/raw/civicdex_adapted.csv"
OUTPUT = "data/processed/seed_dataset.csv"

df = pd.read_csv(INPUT)

print("Original rows:", len(df))

# Remove empty complaints
df = df.dropna(subset=["normalized_text"])

# Normalize only for duplicate detection
df["_dedup_text"] = (
    df["normalized_text"]
    .astype(str)
    .str.strip()
    .str.lower()
)

# Remove duplicate complaints
df = df.drop_duplicates(
    subset=["_dedup_text"],
    keep="first"
)

df = df.drop(columns=["_dedup_text"])

print("Unique rows:", len(df))

# Save seed dataset
df.to_csv(OUTPUT, index=False)

print("Saved:", OUTPUT)