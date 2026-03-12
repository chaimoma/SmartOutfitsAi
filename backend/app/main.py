from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import User, Wardrobe, Recommendation
from .schemas import UserCreate, UserLogin
from .auth import hash_password, verify_password, create_access_token, verify_token
from .services import get_recommendations_with_images, detect_clothing
from pathlib import Path
import json
import uuid

app = FastAPI(title="Smart Outfit API")
Base.metadata.create_all(bind=engine)

# static files
UPLOADS_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DbDep = Depends(get_db)
CATEGORY_MAP = {
    "long sleeve top":      "TOPS",
    "short sleeve top":     "TOPS",
    "vest":                 "TOPS",
    "sling":                "TOPS",
    "skirt":                "BOTTOMS",
    "trousers":             "BOTTOMS",
    "shorts":               "BOTTOMS",
    "long sleeve dress":    "BOTTOMS",
    "short sleeve dress":   "BOTTOMS",
    "sling dress":          "BOTTOMS",
    "long sleeve outwear":  "OUTERWEAR",
    "short sleeve outwear": "OUTERWEAR",
}

# auth
@app.post("/register")
def register(user: UserCreate, db: Session = DbDep):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(400, "Email already registered")
    new_user = User(
        email=user.email,
        password=hash_password(user.password),
        gender=user.gender or "man"
    )
    db.add(new_user)
    db.commit()
    return {"message": "registered"}

@app.post("/login")
def login(user: UserLogin, db: Session = DbDep):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(400, "Invalid credentials")
    token = create_access_token({"sub": db_user.email, "user_id": db_user.id})
    return {"access_token": token, "gender": db_user.gender}

# wardrobe
@app.post("/wardrobe/add")
async def add_to_wardrobe(
    file: UploadFile = File(...),
    token=Depends(verify_token),
    db: Session = DbDep
):
    user_id     = token["user_id"]
    image_bytes = await file.read()

    # detect clothing
    detected = detect_clothing(image_bytes)
    if not detected:
        raise HTTPException(400, "No clothing detected in the image")
    # save image
    filename  = f"{uuid.uuid4()}_{file.filename}"
    filepath  = UPLOADS_DIR / filename
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    # save to database
    items = []
    for label in detected:
        item = Wardrobe(
            user_id        = user_id,
            image_path     = f"/uploads/{filename}",
            detected_label = label
        )
        db.add(item)
        items.append({"label": label, "image_path": f"/uploads/{filename}"})
    db.commit()
    return {"message": "added to wardrobe", "items": items}

@app.get("/wardrobe")
def get_wardrobe(token=Depends(verify_token), db: Session = DbDep):
    user_id = token["user_id"]
    items   = db.query(Wardrobe).filter(Wardrobe.user_id == user_id).all()
    return [
        {
            "id":             item.id,
            "detected_label": item.detected_label,
            "category":       CATEGORY_MAP.get(item.detected_label, "TOPS"),
            "image_url":      f"http://127.0.0.1:8001{item.image_path}",
            "created_at":     item.created_at
        }
        for item in items
    ]

@app.delete("/wardrobe/{item_id}")
def delete_wardrobe_item(item_id: int, token=Depends(verify_token), db: Session = DbDep):
    user_id = token["user_id"]
    item    = db.query(Wardrobe).filter(Wardrobe.id == item_id, Wardrobe.user_id == user_id).first()
    if not item:
        raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}

#recommendation
@app.post("/recommend")
async def recommend(
    file: UploadFile = File(...),
    token=Depends(verify_token),
    db: Session = DbDep
):
    user_id     = token["user_id"]
    image_bytes = await file.read()

    #get user gender
    db_user = db.query(User).filter(User.id == user_id).first()
    gender = db_user.gender if db_user else "man"

    # check wardrobe and internet
    wardrobe_items = db.query(Wardrobe).filter(Wardrobe.user_id == user_id).all()
    wardrobe_labels = {item.detected_label: item for item in wardrobe_items}

    result = get_recommendations_with_images(image_bytes, wardrobe_labels, gender=gender)

    if not result["detected"]:
        raise HTTPException(400, "No clothing detected in the image")

    #save uploaded image for history
    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = UPLOADS_DIR / filename
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    input_image_url = f"http://127.0.0.1:8001/uploads/{filename}"

    #save recommendation to DB
    all_items = result["from_wardrobe"] + result["from_internet"]
    rec = Recommendation(
        user_id         = user_id,
        detected_item   = ", ".join(result["detected"]),
        suggested_items = json.dumps([r["item"] for r in all_items]),
        image_urls      = json.dumps([r["image_url"] for r in all_items]),
        input_image_url = input_image_url,
    )
    db.add(rec)
    db.commit()

    return result

#history
@app.get("/history")
def get_history(token=Depends(verify_token), db: Session = DbDep):
    user_id = token["user_id"]
    recs    = db.query(Recommendation).filter(Recommendation.user_id == user_id).all()
    return [
        {
            "id":              rec.id,
            "detected_item":   rec.detected_item,
            "suggested_items": json.loads(rec.suggested_items),
            "image_urls":      json.loads(rec.image_urls) if rec.image_urls else [],
            "input_image_url": rec.input_image_url,
            "created_at":      rec.created_at
        }
        for rec in recs
    ]