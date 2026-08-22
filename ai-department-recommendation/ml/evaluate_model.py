import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    confusion_matrix,
    ConfusionMatrixDisplay,
    classification_report,
    top_k_accuracy_score
)
import matplotlib.pyplot as plt

DATA_PATH = "data/processed/seed_dataset.csv"
MODEL_PATH = "ml/category_model_calibrated.pkl"

df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["normalized_text", "category"])

X = df["normalized_text"].astype(str)
y = df["category"].astype(str)

_, X_test, _, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

model = joblib.load(MODEL_PATH)

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)

classes = model.classes_

print("=" * 60)
print("MODEL ERROR ANALYSIS")
print("=" * 60)

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)

# Top-3 accuracy
top3 = top_k_accuracy_score(
    y_test,
    probabilities,
    k=3,
    labels=classes
)

print(f"\nTop-3 Accuracy: {top3:.4f}")

# Confusion matrix
cm = confusion_matrix(
    y_test,
    predictions,
    labels=classes
)

print("\nConfusion Matrix:")
print(pd.DataFrame(
    cm,
    index=classes,
    columns=classes
))

# Show actual → predicted mistakes
print("\n" + "=" * 60)
print("MISCLASSIFICATIONS")
print("=" * 60)

errors = []

for text, actual, predicted in zip(
    X_test,
    y_test,
    predictions
):
    if actual != predicted:
        errors.append({
            "text": text,
            "actual": actual,
            "predicted": predicted
        })

for error in errors:
    print(
        f"\nTEXT       : {error['text']}"
        f"\nACTUAL     : {error['actual']}"
        f"\nPREDICTED  : {error['predicted']}"
    )

# Plot
disp = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=classes
)

disp.plot(
    xticks_rotation=45,
    cmap="Blues"
)

plt.tight_layout()
plt.savefig("ml/confusion_matrix.png")

print("\nSaved: ml/confusion_matrix.png")