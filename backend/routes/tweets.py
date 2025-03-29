from datetime import datetime
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import Tweet, User
from schemas import TweetCreate, TweetOut
from database import get_db
from auth import get_current_active_user

router = APIRouter(prefix="/tweets", tags=["Tweets"])

@router.post("/", response_model=TweetOut, status_code=status.HTTP_201_CREATED)
async def create_tweet(
    tweet: TweetCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    """
    Cria um novo tweet para o usuário autenticado.
    
    Args:
        tweet: Dados do tweet a ser criado
        current_user: Usuário autenticado
        db: Sessão do banco de dados
    
    Returns:
        O tweet criado com todos os dados
    """
    try:
        # Validação do conteúdo
        if not tweet.content or not tweet.content.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O conteúdo do tweet não pode ser vazio."
            )

        # Criação do tweet
        db_tweet = Tweet(
            content=tweet.content.strip(),
            owner_id=current_user.id,
            created_at=datetime.utcnow()
        )
        
        db.add(db_tweet)
        db.commit()
        db.refresh(db_tweet)
        
        return TweetOut.model_validate(db_tweet)  # Conversão correta
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar tweet: {str(e)}"
        )

@router.get("/", response_model=List[TweetOut])
async def read_tweets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Lista todos os tweets com paginação.
    """
    return db.query(Tweet).offset(skip).limit(limit).all()

@router.get("/{tweet_id}", response_model=TweetOut)
async def read_tweet(
    tweet_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém um tweet específico pelo ID.
    """
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tweet não encontrado"
        )
    return db_tweet
