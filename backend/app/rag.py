import chromadb
from sentence_transformers import SentenceTransformer
import json

# load embedding model once
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# chromadb setup
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="outfit_recommendations")

def store_recommendation(rec_id: int, detected: list, suggestions: list, gender: str = "man"):
    # store a recommendation in chromadb as a vector
    text = f"gender: {gender}. detected: {', '.join(detected)}. suggested: {', '.join(suggestions)}"
    embedding = embedder.encode(text).tolist()
    collection.upsert(
        ids=[str(rec_id)],
        embeddings=[embedding],
        documents=[text],
        metadatas=[{"detected": json.dumps(detected), "suggestions": json.dumps(suggestions), "gender": gender}]
    )

def search_similar_recommendation(detected: list, gender: str = "man", n_results: int = 1):
    # search for similar past recommendations
    if collection.count() == 0:
        return None
    
    query = f"gender: {gender}. detected: {', '.join(detected)}"
    embedding = embedder.encode(query).tolist()
    results = collection.query(
        query_embeddings=[embedding],
        n_results=min(n_results, collection.count()),
        where={"gender": gender}
    )
    
    if not results["documents"][0]:
        return None
    
    # return suggestions from best match
    best_match = results["metadatas"][0][0]
    distance = results["distances"][0][0]
    
    # only return if similarity is very high
    if distance < 0.25:
        return json.loads(best_match["suggestions"])

    return None