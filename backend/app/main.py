from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import User, Wardrobe, Recommendation
from .schemas import UserCreate, UserLogin
from .auth import hash_password, verify_password, create_access_token, verify_token
from .services import get_recommendations_with_images
import json

app = FastAPI(title="Smart Outfit API")
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
DbDep = Depends(get_db)

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/register")
def register(user: UserCreate, db: Session = DbDep):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(400, "Email already registered")
    new_user = User(email=user.email, password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    return {"message": "registered"}


@app.post("/login")
def login(user: UserLogin, db: Session = DbDep):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(400, "Invalid credentials")
    token = create_access_token({"sub": db_user.email, "user_id": db_user.id})
    return {"access_token": token}


# ── Recommend ─────────────────────────────────────────────────────────────────

@app.post("/recommend")
async def recommend(
    file: UploadFile = File(...),
    token=Depends(verify_token),
    db: Session = DbDep
):
    user_id     = token["user_id"]
    image_bytes = await file.read()

    # Full pipeline: YOLO → Gemini → Google Images
    result = get_recommendations_with_images(image_bytes)

    if not result["detected"]:
        raise HTTPException(400, "No clothing detected in the image")

    # Save to wardrobe
    for label in result["detected"]:
        wardrobe_item = Wardrobe(
            user_id        = user_id,
            image_path     = file.filename,
            detected_label = label
        )
        db.add(wardrobe_item)

    # Save recommendation to DB
    rec = Recommendation(
        user_id         = user_id,
        detected_item   = ", ".join(result["detected"]),
        suggested_items = json.dumps([r["item"] for r in result["recommendations"]]),
        image_urls      = json.dumps([r["image_url"] for r in result["recommendations"]])
    )
    db.add(rec)
    db.commit()

    return result


# ── Wardrobe ──────────────────────────────────────────────────────────────────

@app.get("/wardrobe")
def get_wardrobe(token=Depends(verify_token), db: Session = DbDep):
    user_id = token["user_id"]
    items   = db.query(Wardrobe).filter(Wardrobe.user_id == user_id).all()
    return items


# ── History ───────────────────────────────────────────────────────────────────

@app.get("/history")
def get_history(token=Depends(verify_token), db: Session = DbDep):
    user_id = token["user_id"]
    recs    = db.query(Recommendation).filter(Recommendation.user_id == user_id).all()
    return recs