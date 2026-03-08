from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import User
from .schemas import UserCreate, UserLogin
from .auth import hash_password,verify_password,create_access_token,verify_token

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

# AUTH
@app.post("/register")
def register(user: UserCreate, db: Session = DbDep):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(400, "Email already registered")
    new_user = User(
        email=user.email,password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    return {"message": "registered"}

@app.post("/login")
def login(user: UserLogin, db: Session = DbDep):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(400, "Invalid credentials")
    token = create_access_token({"sub": db_user.email})
    return {"access_token": token}