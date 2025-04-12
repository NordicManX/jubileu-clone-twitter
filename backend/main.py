from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

app = FastAPI()

# Caminho para a pasta build do frontend (gerado com Vite)
frontend_path = Path(__file__).resolve().parent / "frontend" / "build"

# Montar arquivos estáticos
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="static")
