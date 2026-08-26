import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    log_loss,
    f1_score
)


DATA_PATH = "data/processed/combined_department_dataset.csv"
MODEL_PATH = "ml/department_model_calibrated.pkl"


# Load dataset
df = pd.read_csv(DATA_PATH)

df = df.dropna(
    subset=["complaint_text", "department"]
)

X = df["complaint_text"].astype(str)
y = df["department"].astype(str)


print("========================================")
print("DEPARTMENT RECOMMENDATION DATASET")
print("========================================")
print(f"Total records : {len(df)}")
print(f"Departments   : {y.nunique()}")

print("\nRecords per department:")
print(y.value_counts())


# Train/Test split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\n========================================")
print("DATA SPLIT")
print("========================================")
print(f"Training records : {len(X_train)}")
print(f"Testing records  : {len(X_test)}")


# TF-IDF features
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


# Base model
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


# Probability calibration
model = CalibratedClassifierCV(
    estimator=base_model,
    method="sigmoid",
    cv=5,
    n_jobs=-1
)

# Train
print("\n========================================")
print("TRAINING")
print("========================================")

print("Training department recommendation model...")

model.fit(X_train, y_train)


# Predictions
predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)


# Evaluation
accuracy = accuracy_score(
    y_test,
    predictions
)

loss = log_loss(
    y_test,
    probabilities
)

f1 = f1_score(
    y_test,
    predictions,
    average='weighted'
)


print("\n========================================")
print("DEPARTMENT MODEL RESULTS")
print("========================================")

print(f"Accuracy : {accuracy:.4f}")
print(f"F1-Score : {f1:.4f}")
print(f"Log Loss : {loss:.4f}")


print("\nClassification Report:")

print(
    classification_report(
        y_test,
        predictions,
        zero_division=0
    )
)


# Save model
joblib.dump(
    model,
    MODEL_PATH
)


print("\n========================================")
print("MODEL SAVED")
print("========================================")

print(MODEL_PATH)