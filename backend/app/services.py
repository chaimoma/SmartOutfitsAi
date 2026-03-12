from groq import Groq
from ultralytics import YOLO
from PIL import Image
from pathlib import Path
import requests
import os
import io
import ast
import time
from .rag import store_recommendation, search_similar_recommendation
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from MLops.tracking import log_recommendation

# paths
BASE_DIR = Path(__file__).resolve().parents[2]
model_path = BASE_DIR / "ml" / "model" / "model.pt"

# client setup
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
yolo = YOLO(str(model_path))
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

def detect_clothing(image_bytes: bytes) -> list:
    # run yolo on the image
    image = Image.open(io.BytesIO(image_bytes))
    results = yolo.predict(source=image, conf=0.4, verbose=False)
    labels = [results[0].names[c] for c in results[0].boxes.cls.int().tolist()]
    return list(set(labels))

def get_outfit_recommendation(detected_labels: list, gender: str = "man") -> list:
    if not detected_labels:
        return []

    # check existing recommendations
    cached = search_similar_recommendation(detected_labels)
    if cached:
        return cached

    items = ", ".join(detected_labels)
    target_style = "MASCULINE" if gender == "man" else "FEMININE"
    
    prompt = f"""
    A user ({gender}) is wearing: {items}.
    You are a luxury fashion expert. Suggest exactly 4 premium, complementary items to complete this outfit for a {gender}.
    
    CRITICAL GENDER RULE: 
    - the user is a {gender}. 
    - you must suggest items that are strictly {target_style} and appropriate for a {gender}.
    
    CRITICAL CATEGORY RULE:
    - do not suggest any item that the user is already wearing or anything from the same category. 
    - special case: if the user is wearing a 'dress', 'jumpsuit', or 'romper', do not suggest tops (t-shirts, blouses) or bottoms (pants, jeans, skirts). instead, suggest outerwear, shoes, and accessories (bag, jewelry, watch).
    
    STYLE VARIETY:
    - provide creative, high-fashion suggestions. 
    - avoid repetitive white/black basics unless they are essential.
    - focus on a total look (e.g., if a dress is detected, suggest a blazer/coat, heels/flats, a luxury bag, and a necklace/earrings).
    
    Reply ONLY with a Python list of short, descriptive item names.
    No explanation, no markdown, just the list.
    """
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )
    try:
        content = response.choices[0].message.content.strip()
        suggestions = ast.literal_eval(content)
        # remove short or empty strings
        suggestions = [s for s in suggestions if len(s) > 3 and "no addition" not in s.lower()]
    except:
        suggestions = ["white top", "black jeans", "white sneakers", "silver necklace"]
    return suggestions

def search_pexels(query: str, gender: str = "man") -> str:
    try:
        query_text = query.lower()
        gender_type = "men's" if gender == "man" else "women's"
        
        # handle specific shoes or general items
        is_pumps = "pumps" in query_text and "shoes" not in query_text
        search_term = "women's pumps heels shoes" if is_pumps else f"{gender_type} {query_text} fashion clothing"

        url = "https://api.pexels.com/v1/search"
        headers = {"Authorization": PEXELS_API_KEY}
        params = {
            "query": f"{search_term} isolated background",
            "per_page": 15,
            "orientation": "portrait"
        }
        
        response = requests.get(url, headers=headers, params=params)
        photos = response.json().get("photos", [])

        # filter out unrelated objects or styles
        filters = ["naked", "sexy", "lingerie", "underwear", "bikini", "nude", "skin",
                   "bottle", "cosmetic", "lotion", "skincare", "cream", "shampoo",
                   "perfume", "fragrance", "cologne", "makeup"]

        # hide items from other categories
        categories = ["belt", "shoe", "watch", "glasses", "bag", "hat"]
        for cat in categories:
            if cat not in query_text:
                filters.append(cat)

        # block wrong gender results
        if gender == "man":
            filters.extend(["woman", "girl", "female", "lady", "dress", "skirt", "heel", "pumps"])
        else:
            filters.extend(["man", "boy", "male", "guy", "masculine", "beard"])

        for p in photos:
            alt = p.get("alt", "").lower()
            if not any(f in alt for f in filters):
                return p["src"]["medium"]

        return photos[0]["src"]["medium"] if photos else None
    except:
        return None


def get_recommendations_with_images(image_bytes: bytes, wardrobe_labels: dict = {}, gender: str = "man") -> dict:
    # 1: detect clothing
    detected = detect_clothing(image_bytes)
    if not detected:
        return {"detected": [], "from_wardrobe": [], "from_internet": []}

    # 2: fix labels for men
    if gender == "man":
        detected = ["trousers" if label == "skirt" else label for label in detected]
        detected = list(set(detected))

    # 3: get suggestions
    start = time.time()
    from_rag = search_similar_recommendation(detected, gender=gender) is not None
    suggestions = get_outfit_recommendation(detected, gender=gender)
    elapsed = (time.time() - start) * 1000

    # 4: log data
    store_recommendation(hash(str(detected)), detected, suggestions, gender=gender)
    log_recommendation(detected, suggestions, from_rag, elapsed)

    wardrobe_list = []
    internet_list = []

    # 5: check wardrobe then internet
    for item in suggestions:
        match = None
        for label, obj in wardrobe_labels.items():
            if any(w in label.lower() for w in item.lower().split()):
                match = obj
                break

        if match:
            wardrobe_list.append({
                "item": item,
                "image_url": f"http://127.0.0.1:8001{match.image_path}",
                "source": "wardrobe"
            })
        else:
            url = search_pexels(item, gender=gender)
            internet_list.append({
                "item": item,
                "image_url": url,
                "source": "internet"
            })

    return {
        "detected": detected,
        "from_wardrobe": wardrobe_list,
        "from_internet": internet_list
    }