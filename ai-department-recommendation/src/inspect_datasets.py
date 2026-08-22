import pandas as pd

MAIN = "data/raw/civicdex_main.csv"
ADAPTED = "data/raw/civicdex_adapted.csv"

main = pd.read_csv(MAIN)
adapted = pd.read_csv(ADAPTED)

print("=" * 60)
print("CIVICDEX DATASET INSPECTION")
print("=" * 60)

print("\nMAIN DATASET")
print("Rows:", len(main))
print("Columns:", list(main.columns))

print("\nADAPTED DATASET")
print("Rows:", len(adapted))
print("Columns:", list(adapted.columns))

# Find common text column
text_columns = [
    "normalized_text",
    "raw_text",
    "complaint_text",
    "text"
]

text_column = None

for col in text_columns:
    if col in main.columns and col in adapted.columns:
        text_column = col
        break

if text_column is None:
    raise ValueError("No common text column found.")

print("\nText column:", text_column)

# Normalize text for duplicate detection
main_text = (
    main[text_column]
    .fillna("")
    .astype(str)
    .str.strip()
    .str.lower()
)

adapted_text = (
    adapted[text_column]
    .fillna("")
    .astype(str)
    .str.strip()
    .str.lower()
)

# Exact overlap
main_set = set(main_text)
adapted_set = set(adapted_text)

overlap = main_set.intersection(adapted_set)

print("\n" + "=" * 60)
print("DUPLICATE ANALYSIS")
print("=" * 60)

print("Main rows:", len(main))
print("Adapted rows:", len(adapted))
print("Unique main texts:", len(main_set))
print("Unique adapted texts:", len(adapted_set))
print("Exact overlapping texts:", len(overlap))

# Possible final size
combined_unique = len(main_set.union(adapted_set))

print("Combined unique texts:", combined_unique)

print("\n" + "=" * 60)
print("MAIN CATEGORIES")
print("=" * 60)
print(main["category"].value_counts())

print("\n" + "=" * 60)
print("ADAPTED CATEGORIES")
print("=" * 60)
print(adapted["category"].value_counts())