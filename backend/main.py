from fastapi import FastAPI
from routes import users, tweets


app = FastAPI()

# Inclui as rotas
app.include_router(users.router)
app.include_router(tweets.router)
