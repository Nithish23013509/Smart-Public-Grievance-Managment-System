import os
import re
import logging
from typing import List, Union
import numpy as np

logger = logging.getLogger(__name__)

# Default model as specified: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
DEFAULT_MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
MODEL_NAME = os.environ.get("EMBEDDING_MODEL_NAME", DEFAULT_MODEL_NAME)

_model_instance = None


def normalize_for_embedding(text: str) -> str:
    """
    Normalizes text for embedding generation:
    - Strips leading/trailing whitespace
    - Collapses consecutive whitespace characters (newlines, tabs, multiple spaces) into a single space
    - Preserves all letters, numbers, punctuation, Tamil unicode, Tanglish, locations, road names, landmarks
    """
    if not text:
        return ""
    text = str(text).strip()
    text = re.sub(r"\s+", " ", text)
    return text


def get_embedding_model():
    """
    Loads and returns the SentenceTransformer model singleton.
    Loaded once per process to prevent reloading overhead and excessive memory allocation.
    """
    global _model_instance
    if _model_instance is None:
        logger.info(f"Loading SentenceTransformer embedding model: {MODEL_NAME} on CPU...")
        from sentence_transformers import SentenceTransformer
        # Explicitly use CPU to satisfy requirement
        _model_instance = SentenceTransformer(MODEL_NAME, device="cpu")
        logger.info("Embedding model loaded successfully.")
    return _model_instance


def generate_embedding(text: str) -> List[float]:
    """
    Generates a 384-dimensional normalized embedding for a single text.
    Returns python list of floats.
    """
    cleaned = normalize_for_embedding(text)
    if not cleaned:
        # Return 384 zeros for empty text
        return [0.0] * 384
    model = get_embedding_model()
    # normalize_embeddings=True ensures cosine similarity can be computed via dot product
    embedding = model.encode(cleaned, normalize_embeddings=True, show_progress_bar=False)
    return embedding.tolist()


def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generates embeddings for a batch of texts.
    """
    cleaned_texts = [normalize_for_embedding(t) for t in texts]
    if not cleaned_texts:
        return []
    model = get_embedding_model()
    embeddings = model.encode(cleaned_texts, normalize_embeddings=True, batch_size=32, show_progress_bar=False)
    return embeddings.tolist()


def cosine_similarity(vec1: Union[List[float], np.ndarray], vec2: Union[List[float], np.ndarray]) -> float:
    """
    Computes cosine similarity between two vectors.
    Since generated vectors are normalized, dot product equals cosine similarity.
    """
    a = np.array(vec1, dtype=np.float32)
    b = np.array(vec2, dtype=np.float32)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))
