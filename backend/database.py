from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import os
from dotenv import load_dotenv
from pathlib import Path

# Carrega as variáveis do .env
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Monta a URL do banco com base nas variáveis separadas
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
EXTERNAL_DB_URL = os.getenv("EXTERNAL_DB_URL")

# Verifica se as variáveis internas foram carregadas corretamente
if not all([DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD]) and not EXTERNAL_DB_URL:
    print("⚠️ Variáveis de ambiente do banco não foram carregadas corretamente.")
    raise ValueError("Nenhuma URL de banco de dados válida encontrada.")

# Se as variáveis internas forem encontradas, usa elas. Caso contrário, usa a URL externa.
if all([DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD]):
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DATABASE_URL = EXTERNAL_DB_URL

# Cria engine com tratamento de erro
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
except Exception as e:
    print("❌ Erro ao conectar com o banco de dados:")
    print(e)
    raise

# Cria sessão e base
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependência para obter a sessão do banco
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
