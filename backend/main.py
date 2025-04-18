from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import os
from pathlib import Path

# Importe os routers explicitamente para evitar erros
from routes.users import router as users_router
from routes.tweets import router as tweets_router  # se existir

# Carrega as variáveis do .env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Testa a leitura das variáveis
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Imprime as variáveis para garantir que estão sendo carregadas corretamente (remover para produção)
print(f"DB_HOST: {DB_HOST}")
print(f"DB_PORT: {DB_PORT}")
print(f"DB_NAME: {DB_NAME}")
print(f"DB_USER: {DB_USER}")
# Nunca imprima senhas em produção
# print(f"DB_PASSWORD: {DB_PASSWORD}")

# Verifica se todas as variáveis foram carregadas
if not all([DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD]):
    raise ValueError("Variáveis de banco de dados não encontradas no .env")

# Monta a DATABASE_URL usando as variáveis separadas
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Criação do engine do banco de dados
engine = create_engine(DATABASE_URL)

# Tenta realizar uma consulta simples para verificar se a conexão com o banco está funcionando
try:
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print("Conexão com o banco de dados bem-sucedida!")
except Exception as e:
    print(f"Erro ao conectar com o banco de dados: {e}")
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
        "http://localhost:5173",  # Certifique-se de que o front-end está rodando nessa URL
        "http://127.0.0.1:5173",  # Outra porta local
        "https://jubileu-clone-twitter.onrender.com"  # URL de produção, se necessário
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
    return {
        "status": "online",
        "docs": "http://localhost:8000/docs",
        "message": "API do Jubileu (Twitter Clone) rodando"
    }
