from pydantic import BaseModel
from datetime import datetime
from typing import Optional


#auth
class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str

#wardrobe
class WardrobeItemSchema(BaseModel):
    id: int
    image_path: str
    detected_label: str
    created_at: datetime

    class Config:
        from_attributes = True

#recommendation
class RecommendationSchema(BaseModel):
    id: int
    detected_item: str
    suggested_items: str
    image_urls: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True