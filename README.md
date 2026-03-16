# 👔 SmartOutfitAi

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**SmartOutfitAi** is a production-grade, AI-powered fashion assistant that helps users manage their wardrobe and get professional outfit recommendations. Using state-of-the-art Computer Vision (YOLOv8) and Large Language Models (Llama 3 via Groq), it transforms simple clothing photos into curated luxury fashion looks.

---

## 🚀 Key Features

- 📸 **Automatic Clothing Detection**: High-accuracy garment identification using YOLOv8.
- 👗 **Smart Wardrobe**: Digitalize your closet and categorize items (Tops, Bottoms, Outerwear).
- 🧠 **AI Recommendation Engine**: Context-aware outfit suggestions based on gender and style.
- 🔍 **RAG System**: Remembers past high-quality recommendations using ChromaDB vector search.
- 🖼️ **Visual Search**: Integrates with Pexels API to fetch premium product images for suggestions.
- 📊 **MLOps Integrated**: Experiment tracking and performance monitoring with MLflow.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: FastAPI, SQLAlchemy (PostgreSQL), Pydantic.
- **AI/ML**: 
  - **Computer Vision**: Ultralytics YOLOv8 (Clothing detection).
  - **LLM**: Llama 3-70B (via Groq Cloud API).
  - **Vector DB**: ChromaDB (RAG implementation).
  - **Embeddings**: Sentence-Transformers (`all-MiniLM-L6-v2`).
- **DevOps**: Docker, Docker Compose, MLflow.

---

## 🦾 AI Pipeline: How it Works

1.  **Detection**: The user uploads an image. `YOLOv8` detects clothing items (e.g., "short sleeve top", "trousers").
2.  **RAG Check**: The system searches `ChromaDB` for similar past detections. If a high-similarity match exists, it retrieves the cached suggestions to reduce latency and API costs.
3.  **LLM Generation**: If no cache is found, the detected labels are sent to **Llama 3 (Groq)** with a detailed fashion expert prompt. The LLM suggests 4 complementary luxury items.
4.  **Wardrobe Matching**: The system checks the user's digital wardrobe for matches to the suggested items.
5.  **Visual Fetching**: For items not in the wardrobe, the `Pexels API` fetches professional portrait images for a premium UI experience.
6.  **Persistence**: The recommendation is stored in PostgreSQL (history) and ChromaDB (vector index).

---

## ⚙️ Environment Variables

Create a `.env` file in `backend/app/` with the following:

| Variable | Description |
| :--- | :--- |
| `SECRET_KEY` | JWT secret for auth tokens |
| `DB_URL` | PostgreSQL connection string |
| `GROQ_API_KEY` | API Key from [Groq Console](https://console.groq.com/) |
| `PEXELS_API_KEY` | API Key from [Pexels](https://www.pexels.com/api/) |
| `POSTGRES_USER` | Database username (for Docker) |
| `POSTGRES_PASSWORD` | Database password (for Docker) |
| `POSTGRES_DB` | Database name (for Docker) |

---

## 💻 Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & pnpm
- PostgreSQL

### 🖥️ Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r ../requirements.txt
# Ensure .env is configured
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

### 🌐 Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

---

## 🐳 Docker Setup

The easiest way to run the entire stack:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:8001](http://localhost:8001)
- **Documentation**: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Authenticate and get JWT |
| `GET` | `/wardrobe` | Fetch all user's wardrobe items |
| `POST` | `/wardrobe/add` | Upload image & detect clothing |
| `DELETE` | `/wardrobe/{item_id}` | Delete a specific item from wardrobe |
| `POST` | `/recommend` | Start the AI outfit pipeline |
| `GET` | `/history` | View past recommendation history |

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License


Developed with ❤️ by Chaima Zbairi