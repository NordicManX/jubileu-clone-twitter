import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import os
from pathlib import Path

# Importa os routers explicitamente
from routes.users import router as users_router
from routes.tweets import router as tweets_router

# Configuração do logging
logging.basicConfig(level=logging.DEBUG)  # Define o nível de log global como DEBUG
logger = logging.getLogger("uvicorn")
logger.setLevel(logging.DEBUG)  # Define o nível de log para o Uvicorn

# Carrega as variáveis do .env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Carrega a URL completa do banco de dados
DATABASE_URL = os.getenv("EXTERNAL_DB_URL")

if not DATABASE_URL:
    raise ValueError("EXTERNAL_DB_URL não encontrada no .env")

# Criação do engine do banco de dados
engine = create_engine(DATABASE_URL)

# Tenta realizar uma consulta simples para verificar se a conexão com o banco está funcionando
try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        logger.info("Conexão com o banco de dados bem-sucedida!")
except Exception as e:
    logger.error(f"Erro ao conectar com o banco de dados: {e}")
    raise

# Criação do app FastAPI
app = FastAPI(
    title="Jubileu API",
    description="API para o Twitter Clone",
    version="1.0"
)

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Quando estiver rodando localmente
        "http://127.0.0.1:5173",  # Outra URL local
        "https://jubileu-clone-twitter.onrender.com",  # URL de produção do backend
        "https://seu-frontend-no-vercel.vercel.app",  # URL de produção do frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro das rotas
app.include_router(users_router)
app.include_router(tweets_router)

# Rota de saúde
@app.get("/")
def health_check():
    logger.debug("Requisição GET para a raiz recebida.")
    return {
        "status": "online",
        "docs": "http://localhost:8000/docs",
        "message": "API do Jubileu (Twitter Clone) rodando"
    }

