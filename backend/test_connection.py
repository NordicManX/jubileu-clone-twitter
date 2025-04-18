from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv
from pathlib import Path

# Carregar variáveis de ambiente
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Carregar a URL do banco de dados do .env
EXTERNAL_DB_URL = os.getenv("EXTERNAL_DB_URL")

# Cria engine
engine = create_engine(EXTERNAL_DB_URL, pool_pre_ping=True)

def test_connection():
    try:
        # Tenta executar uma query simples para testar a conexão
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Conexão com o banco de dados estabelecida com sucesso!")
    except Exception as e:
        print("❌ Erro ao conectar com o banco de dados:")
        print(e)

if __name__ == "__main__":
    test_connection()
