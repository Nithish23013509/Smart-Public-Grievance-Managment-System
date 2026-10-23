from flask import Flask, request, jsonify
import logging
import os

from recommendation_service import recommend
from embedding_service import (
    generate_embedding,
    generate_embeddings_batch,
    cosine_similarity,
    MODEL_NAME
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({
        "status": "UP",
        "embedding_model": MODEL_NAME,
        "recommendation_service": "UP"
    }), 200


@app.post("/recommend")
def recommendation():
    data = request.get_json()

    if not data or "complaint" not in data:
        return jsonify({
            "error": "complaint is required"
        }), 400

    complaint = data["complaint"].strip()

    if not complaint:
        return jsonify({
            "error": "complaint cannot be empty"
        }), 400

    result = recommend(complaint)
    return jsonify(result)


@app.post("/embed")
def embed_endpoint():
    """
    Generate 384-dimensional multilingual sentence embeddings.
    Accepts:
    { "text": "description" }
    or
    { "texts": ["desc 1", "desc 2"] }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body is required"}), 400

    try:
        if "text" in data:
            text = str(data["text"])
            emb = generate_embedding(text)
            return jsonify({
                "embedding": emb,
                "dimension": len(emb),
                "model": MODEL_NAME
            })
        elif "texts" in data:
            texts = data["texts"]
            if not isinstance(texts, list):
                return jsonify({"error": "'texts' must be a list of strings"}), 400
            embs = generate_embeddings_batch(texts)
            return jsonify({
                "embeddings": embs,
                "dimension": len(embs[0]) if embs else 384,
                "count": len(embs),
                "model": MODEL_NAME
            })
        else:
            return jsonify({"error": "'text' or 'texts' field is required"}), 400
    except Exception as e:
        logger.error(f"Error generating embedding: {e}", exc_info=True)
        return jsonify({"error": f"Embedding generation failed: {str(e)}"}), 500


@app.post("/similarity")
def similarity_endpoint():
    """
    Computes semantic cosine similarity between source text and candidates.
    Supports either raw texts or precomputed embedding vectors.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "JSON body is required"}), 400

    try:
        # Scenario 1: Precomputed embeddings passed
        if "source_embedding" in data and "candidate_embeddings" in data:
            src_emb = data["source_embedding"]
            cand_embs = data["candidate_embeddings"]
            similarities = [cosine_similarity(src_emb, cand) for cand in cand_embs]
            return jsonify({"similarities": similarities})

        # Scenario 2: Raw texts passed
        if "source_text" in data and "candidate_texts" in data:
            src_text = data["source_text"]
            cand_texts = data["candidate_texts"]
            if not isinstance(cand_texts, list):
                return jsonify({"error": "'candidate_texts' must be a list"}), 400

            src_emb = generate_embedding(src_text)
            cand_embs = generate_embeddings_batch(cand_texts)
            similarities = [cosine_similarity(src_emb, cand) for cand in cand_embs]
            return jsonify({
                "similarities": similarities,
                "source_embedding": src_emb
            })

        return jsonify({"error": "Provide ('source_text' and 'candidate_texts') or ('source_embedding' and 'candidate_embeddings')"}), 400
    except Exception as e:
        logger.error(f"Error computing similarity: {e}", exc_info=True)
        return jsonify({"error": f"Similarity calculation failed: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )