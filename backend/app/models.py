from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String, unique=True, index=True, nullable=False)
    password   = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    wardrobe        = relationship("Wardrobe", back_populates="owner")
    recommendations = relationship("Recommendation", back_populates="owner")

class Wardrobe(Base):
    __tablename__ = "wardrobe"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path     = Column(String, nullable=False)
    detected_label = Column(String, nullable=False)
    created_at     = Column(DateTime, default=datetime.now(timezone.utc))
    owner = relationship("User", back_populates="wardrobe")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    detected_item   = Column(String, nullable=False)
    suggested_items = Column(Text, nullable=False)
    image_urls      = Column(Text, nullable=True)
    created_at      = Column(DateTime, default=datetime.now(timezone.utc))
    owner = relationship("User", back_populates="recommendations")