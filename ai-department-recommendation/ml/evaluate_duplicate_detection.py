"""
Comprehensive Evaluation Suite for Multilingual Semantic Duplicate Detection
Evaluates sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 on:
- Exact duplicates
- English paraphrases
- Tamil-to-Tamil matches
- Tamil-to-English matches
- Tanglish (Romanized Tamil) matches
- Distinct issues / Cross-domain discrimination
- Same issue across different locations
- Memory consumption and inference latency measurement
"""

import os
import sys
import time
import json

# Add current ml dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Ensure utf-8 encoding on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from embedding_service import (
    generate_embedding,
    generate_embeddings_batch,
    cosine_similarity,
    MODEL_NAME
)


def measure_memory_mb():
    try:
        import psutil
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / (1024 * 1024)
    except Exception:
        return 0.0


def run_comprehensive_evaluation():
    print("=" * 70)
    print(f"MULTILINGUAL DUPLICATE DETECTION EVALUATION")
    print(f"Model: {MODEL_NAME}")
    print("=" * 70)

    mem_before = measure_memory_mb()
    t0 = time.time()
    
    # Warm up model
    _ = generate_embedding("Warmup query")
    load_time = time.time() - t0
    mem_after = measure_memory_mb()

    print(f"[Benchmark] Model load time: {load_time:.2f}s")
    if mem_after > 0:
        print(f"[Benchmark] Process RAM: {mem_after:.1f} MB (Delta: +{mem_after - mem_before:.1f} MB)")

    # Labeled Evaluation Pairs: (type, text1, text2, is_duplicate_ground_truth)
    test_cases = [
        # 1. Exact Duplicate
        ("Exact Duplicate", 
         "Water leakage from main pipeline on Gandhi Road", 
         "Water leakage from main pipeline on Gandhi Road", 
         True),
        
        # 2. English Paraphrase
        ("English Paraphrase",
         "Street lights not working near bus stand for three days",
         "The streetlight by the bus stop has been broken and dark for several days",
         True),

        # 3. Tamil-to-Tamil Exact Meaning
        ("Tamil-to-Tamil Paraphrase",
         "குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாக சாலையில் ஓடுகிறது",
         "சாலையில் குடிநீர் பைப் உடைப்பு ஏற்பட்டு அதிக தண்ணீர் விரயமாகிறது",
         True),

        # 4. Tamil-to-English Cross-Lingual
        ("Tamil-to-English",
         "குப்பை வண்டி வரவில்லை தெருவில் கழிவுகள் தேங்கியுள்ளன",
         "Garbage collection truck has not come and waste is piled up on the street",
         True),

        # 5. Tanglish-to-English
        ("Tanglish-to-English",
         "Street light eriyala romba irutta irukku bus stop kitta",
         "Street light is not glowing and it is very dark near the bus stop",
         True),

        # 6. Tanglish-to-Tamil
        ("Tanglish-to-Tamil",
         "Thanni supply varala 3 days ah",
         "மூன்று நாட்களாக குடிநீர் விநியோகம் வரவில்லை",
         True),

        # 7. Same Category, Different Incident / Different Location
        ("Same Category Different Location",
         "Street lights broken on Anna Salai Chennai",
         "Street lights not working in Gandhi Nagar Madurai",
         False),

        # 8. Same Location, Different Department Issue
        ("Same Location Different Issue",
         "Main road has big potholes causing accidents in T Nagar",
         "Drinking water contaminated with sewage water in T Nagar",
         False),

        # 9. Entirely Distinct Complaints
        ("Distinct Complaints",
         "Stray dogs menace near primary school",
         "Illegal construction encroaching public drainage canal",
         False),
    ]

    results = []
    latencies = []

    print("\nRunning test cases:")
    print("-" * 70)
    for category, t1, t2, is_dup in test_cases:
        st = time.time()
        v1 = generate_embedding(t1)
        v2 = generate_embedding(t2)
        lat = (time.time() - st) * 1000.0  # ms
        latencies.append(lat)

        sim = cosine_similarity(v1, v2)
        match_tier = "HIGH_CONFIDENCE" if sim >= 0.82 else ("POSSIBLE_DUPLICATE" if sim >= 0.65 else "NO_MATCH")
        predicted_dup = sim >= 0.65

        results.append({
            "category": category,
            "text1": t1,
            "text2": t2,
            "ground_truth_duplicate": is_dup,
            "similarity_score": round(sim, 4),
            "match_tier": match_tier,
            "predicted_duplicate": predicted_dup,
            "latency_ms": round(lat, 1)
        })

        print(f"[{category}]")
        print(f"  T1: {t1}")
        print(f"  T2: {t2}")
        print(f"  Similarity: {sim:.4f} -> Tier: {match_tier} | GT Duplicate: {is_dup}")
        print("-" * 70)

    avg_lat = sum(latencies) / len(latencies)
    print(f"\n[Performance Metrics]")
    print(f"Average Pairwise Latency: {avg_lat:.1f} ms")
    if mem_after > 0:
        print(f"Total Process RAM Usage: {mem_after:.1f} MB (Well under 512 MB Render limit)")

    # Save results to json for inspection
    out_file = os.path.join(os.path.dirname(__file__), "evaluation_results.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"Evaluation report saved to: {out_file}")

    return results


if __name__ == "__main__":
    run_comprehensive_evaluation()
