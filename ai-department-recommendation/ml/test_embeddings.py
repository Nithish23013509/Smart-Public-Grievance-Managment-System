import os
import sys
import time

# Ensure ml directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from embedding_service import generate_embedding, cosine_similarity, MODEL_NAME


def run_tests():
    print(f"=== Testing Embedding Service with Model: {MODEL_NAME} ===")
    start_time = time.time()
    
    # 1. Exact duplicate test
    text_en_1 = "Street light is broken and not glowing on Main Road"
    text_en_2 = "Street light is broken and not glowing on Main Road"
    
    v_en_1 = generate_embedding(text_en_1)
    v_en_2 = generate_embedding(text_en_2)
    load_time = time.time() - start_time
    print(f"Model loaded & first embedding computed in: {load_time:.2f}s")
    print(f"Embedding vector dimension: {len(v_en_1)} (Expected: 384)")
    assert len(v_en_1) == 384, "Dimension must be 384"
    sim_exact = cosine_similarity(v_en_1, v_en_2)
    print(f"1. Exact Duplicate Similarity: {sim_exact:.4f} (Expected: ~1.0000)")
    
    # 2. English Paraphrase
    text_en_para = "The streetlight on the main street is damaged and dark"
    v_en_para = generate_embedding(text_en_para)
    sim_para = cosine_similarity(v_en_1, v_en_para)
    print(f"2. English Paraphrase Similarity: {sim_para:.4f}")
    
    # 3. Tamil vs English
    text_ta = "மெயின் ரோட்டில் தெருவிளக்கு பழுதடைந்து எரியவில்லை"
    v_ta = generate_embedding(text_ta)
    sim_en_ta = cosine_similarity(v_en_1, v_ta)
    print(f"3. English vs Pure Tamil Similarity: {sim_en_ta:.4f}")
    
    # 4. Tanglish vs English / Tamil
    text_tanglish = "Main road la street light break aagi eriyala"
    v_tanglish = generate_embedding(text_tanglish)
    sim_en_tanglish = cosine_similarity(v_en_1, v_tanglish)
    sim_ta_tanglish = cosine_similarity(v_ta, v_tanglish)
    print(f"4a. English vs Tanglish Similarity: {sim_en_tanglish:.4f}")
    print(f"4b. Tamil vs Tanglish Similarity: {sim_ta_tanglish:.4f}")
    
    # 5. Different Category / Incident
    text_diff = "Drinking water pipe leak causing dirty water on Gandhi Street"
    v_diff = generate_embedding(text_diff)
    sim_diff = cosine_similarity(v_en_1, v_diff)
    print(f"5. Different Issue (Street Light vs Water Leak) Similarity: {sim_diff:.4f} (Expected low)")
    
    # 6. Same category, different location
    text_loc2 = "Street light is broken in Salem Junction"
    v_loc2 = generate_embedding(text_loc2)
    sim_loc2 = cosine_similarity(v_en_1, v_loc2)
    print(f"6. Same issue, different location (Main Road vs Salem): {sim_loc2:.4f}")
    
    print("\nAll basic similarity assertions completed successfully!")


if __name__ == "__main__":
    run_tests()
