from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routes.users import router as users_router
from routes.tweets import router as tweets_router
import os

app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users_router)
app.include_router(tweets_router)

# Servir arquivos estáticos do frontend
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/dist"))
app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="static")

# Servir index.html na raiz
@app.get("/")
def read_index():
    return FileResponse(os.path.join(frontend_path, "index.html"))

# SPA fallback: todas outras rotas retornam index.html
@app.get("/{full_path:path}")
def spa_fallback(full_path: str):
    file_path = os.path.join(frontend_path, full_path)
    if os.path.exists(file_path) and not os.path.isdir(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(frontend_path, "index.html"))
