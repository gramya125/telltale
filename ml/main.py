from fastapi import FastAPI
from pymongo import MongoClient
import joblib
import pandas as pd
import numpy as np
import os
from sklearn.metrics.pairwise import cosine_similarity
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import snapshot_download

app = FastAPI()

# ============================================
# 🌐 CORS
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# 🔌 MONGODB
# ============================================

client = MongoClient(os.getenv("MONGODB_URI"))
db = client["telltale"]
books_collection = db["books"]

books = pd.DataFrame(list(books_collection.find({}, {"_id": 0})))

if not books.empty:
    books["book_id"] = books["book_id"].astype(int)

print(f"📚 Loaded {len(books)} books")

# ============================================
# 📥 DOWNLOAD MODELS (only once)
# ============================================

print("⬇️ Fetching models from Hugging Face...")

MODEL_DIR = snapshot_download(
    repo_id="ramyag125/telltaleml",
    token=os.getenv("HF_TOKEN"),
    local_dir="models",
    local_dir_use_symlinks=False
)
print("✅ Models ready")

# ============================================
# 📦 LOAD MODELS (once)
# ============================================

def load_models():
    return {
        "U": joblib.load(os.path.join(MODEL_DIR, "U.pkl")),
        "sigma": joblib.load(os.path.join(MODEL_DIR, "sigma.pkl")),
        "Vt": joblib.load(os.path.join(MODEL_DIR, "Vt.pkl")),
        "interaction_matrix": joblib.load(os.path.join(MODEL_DIR, "interaction_matrix.pkl")),
        "tfidf_matrix": joblib.load(os.path.join(MODEL_DIR, "tfidf_matrix.pkl")),
        "pop_scores": joblib.load(os.path.join(MODEL_DIR, "pop_scores.pkl")),
        "user_mapper": joblib.load(os.path.join(MODEL_DIR, "user_mapper.pkl")),
        "user_inv_mapper": joblib.load(os.path.join(MODEL_DIR, "user_inv_mapper.pkl")),
        "book_mapper": joblib.load(os.path.join(MODEL_DIR, "book_mapper.pkl")),
    }

models = load_models()

U = models["U"]
sigma = models["sigma"]
Vt = models["Vt"]
interaction_matrix = models["interaction_matrix"]
tfidf_matrix = models["tfidf_matrix"]
pop_scores = models["pop_scores"]
user_mapper = models["user_mapper"]
user_inv_mapper = models["user_inv_mapper"]
book_mapper = models["book_mapper"]

print("🚀 Models loaded successfully")

# ============================================
# ❄️ COLD START
# ============================================

def cold_start(top_n=10):
    top_idx = np.argsort(-pop_scores)[:top_n]
    recs = []

    for idx in top_idx:
        book_id = book_mapper[idx]
        book_info = books[books["book_id"] == book_id]

        if not book_info.empty:
            recs.append({
                "book_id": int(book_id),
                "title": book_info.iloc[0]["title"],
                "genre": book_info.iloc[0]["genre"],
                "score": float(pop_scores[idx])
            })

    return recs

# ============================================
# 🧠 RECOMMENDATION
# ============================================

def recommend(user_id, top_n=10, alpha=0.7):

    if user_id not in user_inv_mapper:
        return cold_start(top_n)

    user_idx = user_inv_mapper[user_id]

    collab_scores = U[user_idx] @ sigma @ Vt
    interacted = interaction_matrix[user_idx].toarray().flatten()

    # limit computation
    top_candidates = np.argsort(-collab_scores)[:300]

    content_scores = np.zeros(len(collab_scores))

    top_rated = np.argsort(-interacted)[:5]

    for b_idx in top_rated:
        if b_idx < tfidf_matrix.shape[0] and interacted[b_idx] > 0:
            sim = cosine_similarity(
                tfidf_matrix[b_idx:b_idx+1], tfidf_matrix
            ).flatten()
            content_scores += sim * interacted[b_idx]

    # normalize safely
    collab_scores /= (np.max(collab_scores) + 1e-9)

    if np.max(content_scores) > 0:
        content_scores /= (np.max(content_scores) + 1e-9)

    final_scores = alpha * collab_scores + (1 - alpha) * content_scores

    final_subset = final_scores[top_candidates]
    ranking = top_candidates[np.argsort(-final_subset)]

    recs = []

    for idx in ranking:
        if len(recs) >= top_n:
            break

        if interacted[idx] != 0:
            continue

        book_id = book_mapper[idx]
        book_info = books[books["book_id"] == book_id]

        if book_info.empty:
            continue

        recs.append({
            "book_id": int(book_id),
            "title": book_info.iloc[0]["title"],
            "genre": book_info.iloc[0]["genre"],
            "score": float(round(final_scores[idx], 4))
        })

    return recs

# ============================================
# 🌐 API
# ============================================

@app.get("/")
def root():
    return {"message": "TellTale ML API", "status": "running"}

@app.get("/recommend/{user_id}")
def get_recommendations(user_id: str, top_n: int = 10):
    try:
        recs = recommend(user_id, top_n)
        return {
            "user_id": user_id,
            "recommendations": recs,
            "total": len(recs)
        }
    except Exception as e:
        return {"error": str(e), "fallback": cold_start(top_n)}

@app.get("/popular")
def get_popular_books(top_n: int = 10):
    return {"recommendations": cold_start(top_n)}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "books_loaded": len(books),
        "models_loaded": True
    }