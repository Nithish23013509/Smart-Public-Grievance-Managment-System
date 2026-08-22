import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, classification_report, log_loss

DATA_PATH = "data/processed/seed_dataset.csv"
MODEL_PATH = "ml/category_model_calibrated.pkl"

df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["normalized_text", "category"])

X = df["normalized_text"].astype(str)
y = df["category"].astype(str)

# Keep a completely separate test set
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

features = FeatureUnion([
    (
        "word",
        TfidfVectorizer(
            analyzer="word",
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1
        )
    ),
    (
        "char",
        TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            sublinear_tf=True,
            min_df=1
        )
    )
])

base_model = Pipeline([
    ("features", features),
    (
        "classifier",
        LogisticRegression(
            max_iter=3000,
            class_weight="balanced"
        )
    )
])

# Sigmoid calibration
model = CalibratedClassifierCV(
    estimator=base_model,
    method="sigmoid",
    cv=5
)

print("Training calibrated model...")

model.fit(X_train, y_train)

predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)

accuracy = accuracy_score(y_test, predictions)
loss = log_loss(y_test, probabilities)

print("\n========================================")
print("CALIBRATED MODEL RESULTS")
print("========================================")

print(f"Accuracy : {accuracy:.4f}")
print(f"Log Loss : {loss:.4f}")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)

joblib.dump(model, MODEL_PATH)

print("\nSaved:")
print(MODEL_PATH)