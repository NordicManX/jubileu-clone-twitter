from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os

# Lê a variável DATABASE_URL do ambiente (.env local ou Railway)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nelson:admin@localhost:5432/twitter_clone")

# Cria o engine com base nessa URL
engine = create_engine(DATABASE_URL)

# Cria sessões para acessar o banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos do banco
Base = declarative_base()

# Função que fornece a sessão do banco (usada nas rotas)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
