import pandas as pd

def main():
    print("Loading datasets...")
    
    # 1. Existing Data
    # The existing seed dataset uses 'normalized_text' for the text feature
    df_existing = pd.read_csv("data/processed/seed_dataset.csv")
    
    # Keep only relevant columns for department recommendation and rename to match
    df_existing = df_existing[["normalized_text", "department", "language_type"]].rename(
        columns={"normalized_text": "complaint_text", "language_type": "language"}
    )
    
    # Drop rows without text or department
    df_existing = df_existing.dropna(subset=["complaint_text", "department"])
    print(f"Existing dataset records: {len(df_existing)}")
    
    # 2. New Data
    df_new = pd.read_csv("data/raw/department_recommendation_dataset.csv")
    df_new = df_new[["complaint_text", "department", "language"]]
    df_new = df_new.dropna(subset=["complaint_text", "department"])
    print(f"New dataset records: {len(df_new)}")
    
    # 3. Combine
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    print(f"Combined total before deduplication: {len(df_combined)}")
    
    # 4. Deduplicate based on exact text
    df_combined = df_combined.drop_duplicates(subset=["complaint_text"])
    print(f"Combined total after deduplication: {len(df_combined)}")
    
    # 5. Save
    df_combined.to_csv("data/processed/combined_department_dataset.csv", index=False)
    print("Saved to data/processed/combined_department_dataset.csv")

if __name__ == "__main__":
    main()
