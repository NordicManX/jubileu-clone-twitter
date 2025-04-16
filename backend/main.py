from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import create_engine
import os

from routes import users, tweets  # ← Inclua todas as rotas que quiser usar

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL não encontrada no .env")

engine = create_engine(DATABASE_URL)

app = FastAPI()

# CORS (libera acesso pro frontend Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Ajusta se estiver em outra porta
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra as rotas
app.include_router(users.router, prefix="/api/users")
app.include_router(tweets.router, prefix="/api/tweets")  # ← se tiver tweets

@app.get("/")
def read_root():
    return {"message": "API do Jubileu rodando com frontend separado"}
