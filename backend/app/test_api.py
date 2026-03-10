import os
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'app', '.env'))

from .main import app

client = TestClient(app)

#auth tests

def test_register():
    response = client.post("/register", json={
        "email": "testuser1@test.com",
        "password": "123456"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "registered"

def test_register_duplicate():
    client.post("/register", json={"email": "duplicate@test.com", "password": "123456"})
    response = client.post("/register", json={"email": "duplicate@test.com", "password": "123456"})
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_login_success():
    client.post("/register", json={"email": "login@test.com", "password": "123456"})
    response = client.post("/login", json={"email": "login@test.com", "password": "123456"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    client.post("/register", json={"email": "wrong@test.com", "password": "123456"})
    response = client.post("/login", json={"email": "wrong@test.com", "password": "wrongpass"})
    assert response.status_code == 400


#wardrobe tests
def get_token():
    client.post("/register", json={"email": "wardrobe@test.com", "password": "123456"})
    response = client.post("/login", json={"email": "wardrobe@test.com", "password": "123456"})
    return response.json()["access_token"]

def test_get_wardrobe_empty():
    token = get_token()
    response = client.get("/wardrobe", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_wardrobe_unauthorized():
    response = client.get("/wardrobe")
    assert response.status_code == 401


#history tests
def test_get_history_empty():
    token = get_token()
    response = client.get("/history", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_history_unauthorized():
    response = client.get("/history")
    assert response.status_code == 401