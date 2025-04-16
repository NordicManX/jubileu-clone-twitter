from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import create_engine
import os

# Importe os routers explicitamente para evitar erros
from routes.users import router as users_router
from routes.tweets import router as tweets_router  # se existir

load_dotenv()

# Configuração do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL não encontrada no .env")

engine = create_engine(DATABASE_URL)

# Criação do app FastAPI
app = FastAPI(
    title="Jubileu API",
    description="API para o Twitter Clone",
    version="1.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Ambos para desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro das rotas (note que não usamos prefixo duplo)
app.include_router(users_router)  # Já tem prefixo /api/users no próprio router
app.include_router(tweets_router)  # Se existir

@app.get("/")
def health_check():
    return {
        "status": "online",
        "docs": "http://localhost:8000/docs",
        "message": "API do Jubileu (Twitter Clone) rodando"
    }