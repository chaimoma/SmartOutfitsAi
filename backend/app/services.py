from groq import Groq
from ultralytics import YOLO
from PIL import Image
from pathlib import Path
import requests
import os
import io
import ast
from .rag import store_recommendation, search_similar_recommendation

#paths
BASE_DIR   = Path(__file__).resolve().parents[2]
model_path = BASE_DIR / "ml" / "model" / "model.pt"
#load models once at startup 
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
yolo   = YOLO(str(model_path))
#pexels
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

def detect_clothing(image_bytes: bytes) -> list:
    """run YOLO on image, return list of detected clothing labels."""
    image   = Image.open(io.BytesIO(image_bytes))
    results = yolo.predict(source=image, conf=0.25, verbose=False)
    labels  = [results[0].names[c] for c in results[0].boxes.cls.int().tolist()]
    return list(set(labels))

def get_outfit_recommendation(detected_labels: list) -> list:
    """ask Groq for a complete outfit suggestion."""
    if not detected_labels:
        return []

    # check RAG first
    cached = search_similar_recommendation(detected_labels)
    if cached:
        print("RAG hit! Returning cached recommendation.")
        return cached

    items  = ", ".join(detected_labels)
    prompt = f"""
    A user is wearing: {items}.
    You are a fashion expert. Suggest exactly 4 complementary items to complete this outfit.
    Include: a top or outer layer, bottoms or full outfit piece, shoes, and one accessory.
    Reply ONLY with a Python list of short item names, like:
    ["white fitted top", "black jeans", "white sneakers", "silver necklace"]
    No explanation, no markdown, just the list.
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    try:
        suggestions = ast.literal_eval(response.choices[0].message.content.strip())
        #filter out nonsense suggestions
        suggestions = [s for s in suggestions if "no addition" not in s.lower() and len(s) > 3]
    except Exception:
        suggestions = ["white top", "black jeans", "white sneakers", "silver necklace"]
    return suggestions

def search_pexels(query: str) -> str:
    """search Pexels for a clothing item, return first image URL."""
    try:
        url      = "https://api.pexels.com/v1/search"
        headers  = {"Authorization": PEXELS_API_KEY}
        params   = {"query": query + " fashion clothing", "per_page": 1}
        response = requests.get(url, headers=headers, params=params)
        data     = response.json()
        return data["photos"][0]["src"]["medium"]
    except Exception as e:
        print(f"Image search error: {e}")
        return None


def get_recommendations_with_images(image_bytes: bytes, wardrobe_labels: dict = {}) -> dict:
    """full pipeline: detect → recommend → check wardrobe → fill from Pexels."""

    # step 1: detect clothing
    detected = detect_clothing(image_bytes)
    if not detected:
        return {"detected": [], "from_wardrobe": [], "from_internet": []}

    # step 2: get complete outfit suggestions (RAG first, then Groq)
    suggestions = get_outfit_recommendation(detected)

    # step 3: store recommendation in RAG for future use
    store_recommendation(hash(str(detected)), detected, suggestions)

    from_wardrobe = []
    from_internet = []

    # step 4: for each suggestion, check wardrobe first
    for item in suggestions:
        matched = None
        for label, wardrobe_item in wardrobe_labels.items():
            if any(word in label.lower() for word in item.lower().split()):
                matched = wardrobe_item
                break

        if matched:
            from_wardrobe.append({
                "item":      item,
                "image_url": f"http://127.0.0.1:8001{matched.image_path}",
                "source":    "wardrobe"
            })
        else:
            image_url = search_pexels(item)
            from_internet.append({
                "item":      item,
                "image_url": image_url,
                "source":    "internet"
            })

    return {
        "detected":      detected,
        "from_wardrobe": from_wardrobe,
        "from_internet": from_internet
    }