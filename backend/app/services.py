from groq import Groq
from ultralytics import YOLO
from PIL import Image
from pathlib import Path
import requests
import os
import io
import ast

#Paths
BASE_DIR   = Path(__file__).resolve().parents[2]  # SmartOutfitAi/
model_path = BASE_DIR / "ml" / "model" / "model.pt"

#load models once at startup
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
yolo   = YOLO(str(model_path))

#pexels(for image suggestions)
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")


def detect_clothing(image_bytes: bytes) -> list:
    """Run YOLO on image, return list of detected clothing labels."""
    image   = Image.open(io.BytesIO(image_bytes))
    results = yolo.predict(source=image, conf=0.25, verbose=False)
    labels  = [results[0].names[c] for c in results[0].boxes.cls.int().tolist()]
    return list(set(labels))


def get_outfit_recommendation(detected_labels: list) -> list:
    """Ask Groq LLM for matching items, returns a list of item names."""
    if not detected_labels:
        return []

    items  = ", ".join(detected_labels)
    prompt = f"""
    A user is wearing: {items}.
    You are a fashion expert. Suggest exactly 3 complementary clothing items or accessories 
    that would complete this outfit.
    Reply ONLY with a Python list of short item names, like:
    ["white fitted top", "black sneakers", "silver necklace"]
    No explanation, no markdown, just the list.
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    try:
        suggestions = ast.literal_eval(response.choices[0].message.content.strip())
    except Exception:
        suggestions = ["white top", "black trousers", "white sneakers"]

    return suggestions


def search_images(query: str) -> str:
    """search Pexels for a clothing item, return first image URL."""
    try:
        url      = "https://api.pexels.com/v1/search"
        headers  = {"Authorization": PEXELS_API_KEY}
        params   = {"query": query + " fashion clothing", "per_page": 1}
        response = requests.get(url, headers=headers, params=params)
        data     = response.json()
        return data["photos"][0]["src"]["medium"]
    except Exception as e:
        print(f"image search error: {e}")
        return None


def get_recommendations_with_images(image_bytes: bytes) -> dict:
    """Full pipeline: detect → recommend → fetch images."""

    detected = detect_clothing(image_bytes)
    if not detected:
        return {"detected": [], "recommendations": []}

    suggestions = get_outfit_recommendation(detected)

    recommendations = []
    for item in suggestions:
        image_url = search_images(item)
        recommendations.append({
            "item":      item,
            "image_url": image_url
        })

    return {
        "detected":        detected,
        "recommendations": recommendations
    }