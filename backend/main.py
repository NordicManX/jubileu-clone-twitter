from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.users import router as users_router
from routes.tweets import router as tweets_router

app = FastAPI()

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclua os routers SEM prefixo adicional
app.include_router(users_router)
app.include_router(tweets_router)

@app.get("/")
def read_root():
    return {"message": "Twitter Clone API"}