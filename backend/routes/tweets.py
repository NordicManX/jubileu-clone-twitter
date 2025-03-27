from fastapi import Depends, APIRouter, HTTPException
from models import Tweet  # Certifique-se de que o modelo Tweet está definido corretamente
from schemas import TweetCreate, TweetOut  # Certifique-se de que os esquemas estão definidos corretamente
from sqlalchemy.orm import Session
from database import get_db  # Supondo que você tenha uma função para obter a sessão do banco de dados
from typing import List  # Adicione esta linha para corrigir o erro

router = APIRouter()

@router.post("/tweets", response_model=TweetOut)
def create_tweet(tweet: TweetCreate, db: Session = Depends(get_db)):
    db_tweet = Tweet(content=tweet.content, user_id=tweet.user_id)
    db.add(db_tweet)
    db.commit()
    db.refresh(db_tweet)
    return db_tweet

@router.get("/tweets", response_model=List[TweetOut])
def get_tweets(db: Session = Depends(get_db)):
    tweets = db.query(Tweet).all()
    return tweets
