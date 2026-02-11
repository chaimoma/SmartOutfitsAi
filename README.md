
---

# Smart AI Outfits

## Project Overview

Smart AI Outfits is an AI-powered fashion recommendation application that helps users choose complementary outfits based on what they are currently wearing and the clothes they own.

The system uses computer vision and deep learning models to detect clothing items, extract visual features such as type and dominant color, and generate personalized outfit recommendations.

The project implements a full AI lifecycle including data preparation, model training, API development, front-end integration, MLOps practices, and security compliance (JWT authentication and RGPD considerations).

---

## Objectives

* Detect clothing items from user-uploaded images
* Classify clothing type and extract visual features
* Recommend complementary outfit combinations
* Allow users to manage a digital wardrobe
* Expose the AI model via a secure REST API
* Deploy the application using Docker and CI/CD pipelines

---

## Architecture

The system follows a modular AI architecture:

* Data Layer: Image dataset (DeepFashion subset), preprocessing, feature extraction
* ML Layer: YOLOv8 for clothing detection + CNN/ResNet embeddings for feature extraction
* Recommendation Engine: Similarity-based recommendation using feature vectors
* Backend API: FastAPI with JWT authentication
* Frontend: React-based user interface
* MLOps: Docker, CI/CD, logging and monitoring

---

## AI Pipeline

1. Data collection and cleaning
2. Image resizing and normalization
3. Feature extraction (RGB dominant color + embeddings)
4. Model training and evaluation
5. Recommendation engine implementation
6. API exposure and secure authentication
7. Deployment and monitoring

---

## Tech Stack

### AI / Machine Learning

* Python
* PyTorch
* YOLOv8
* ResNet (feature extraction)
* Pandas / NumPy / Matplotlib

### Backend

* FastAPI
* JWT Authentication
* SQL Database

### Frontend

* React
* Tailwind CSS

### DevOps & MLOps

* Docker
* GitHub Actions
* Logging & monitoring tools

---

## Security & Compliance

* JWT-based authentication
* Role-based access control
* Data anonymization principles (RGPD)
* Secure API endpoints

---

## How to Run Locally

### Backend

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```
cd frontend
npm install
npm run dev
```

---

## Author

Chaimaa Zbairi
AI Developer – Simplon Maghreb

---