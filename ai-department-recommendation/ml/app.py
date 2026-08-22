from flask import Flask, request, jsonify

from recommendation_service import recommend

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({
        "status": "UP",
        "service": "AI Department Recommendation"
    })


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


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )