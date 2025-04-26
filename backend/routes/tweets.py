from datetime import datetime
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Verifique se os caminhos de import estão corretos para sua estrutura
from backend.models import Tweet, User, Comment # Ou ..models
from backend.schemas import ( # Ou ..schemas
    TweetCreate, TweetOut, TweetUpdate,
    CommentCreate, CommentOut
)
from backend.database import get_db # Ou ..database
from backend.auth import get_current_user # Ou ..auth

router = APIRouter(prefix="/tweets", tags=["Tweets"])


# ===================== TWEETS =====================

@router.post("/", response_model=TweetOut, status_code=status.HTTP_201_CREATED)
async def create_tweet(
    tweet: TweetCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Cria um novo tweet para o usuário autenticado."""
    content = tweet.content.strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O conteúdo do tweet não pode ser vazio.")
    db_tweet = Tweet(content=content, owner_id=current_user.id, created_at=datetime.utcnow())
    db.add(db_tweet)
    db.commit()
    db.refresh(db_tweet)
    return TweetOut.model_validate(db_tweet)


@router.get("/", response_model=List[TweetOut])
async def read_tweets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Lista todos os tweets com paginação."""
    tweets = (db.query(Tweet).order_by(Tweet.created_at.desc()).offset(skip).limit(limit).all())
    return tweets


@router.get("/{tweet_id}", response_model=TweetOut)
async def read_tweet(tweet_id: int, db: Session = Depends(get_db)):
    """Obtém um tweet específico pelo ID."""
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")
    return db_tweet


@router.put("/{tweet_id}", response_model=TweetOut)
async def update_tweet(
    tweet_id: int,
    tweet_data: TweetUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Atualiza um tweet pelo ID, se for do usuário autenticado."""
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")

    # <<< AJUSTE AQUI: Converte owner_id para int antes de comparar >>>
    if int(db_tweet.owner_id) != current_user.id:
        # Logs de diagnóstico (podem ser removidos após correção)
        print(f"--- CHECK PERMISSÃO UPDATE TWEET (BACKEND) ---")
        print(f"Tweet ID Recebido: {tweet_id}")
        print(f"ID Usuário Atual (do Token): {current_user.id} (Tipo: {type(current_user.id)})")
        print(f"ID Dono do Tweet (do DB): {db_tweet.owner_id} (Tipo: {type(db_tweet.owner_id)})")
        print(f"Resultado da Comparação (int(owner_id) != current_user.id): {int(db_tweet.owner_id) != current_user.id}")
        print(f"!!! ACESSO NEGADO (UPDATE) PELO BACKEND !!!")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar este tweet."
        )

    new_content = tweet_data.content.strip()
    if not new_content:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O conteúdo do tweet não pode ser vazio.")
    db_tweet.content = new_content
    print(f"Permissão UPDATE OK. Atualizando tweet {tweet_id}...")
    db.commit()
    db.refresh(db_tweet)
    return db_tweet


@router.delete("/{tweet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tweet(
    tweet_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Exclui um tweet pelo ID, se for do usuário autenticado."""
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet:
         print(f"Tentativa de deletar tweet {tweet_id} não encontrado.")
         # Decide se retorna erro ou não
         # raise HTTPException(status_code=404, detail="Tweet não encontrado.")
         return # Retorna 204 mesmo se não encontrado

    # Logs de diagnóstico (mantidos por enquanto)
    print(f"--- CHECK PERMISSÃO DELETE TWEET (BACKEND) ---")
    print(f"Tweet ID Recebido: {tweet_id}")
    print(f"ID Usuário Atual (do Token): {current_user.id} (Tipo: {type(current_user.id)})")
    print(f"ID Dono do Tweet (do DB): {db_tweet.owner_id} (Tipo: {type(db_tweet.owner_id)})")
    # <<< AJUSTE AQUI: Converte owner_id para int antes de comparar >>>
    owner_id_int = int(db_tweet.owner_id) # Converte primeiro
    print(f"Resultado da Comparação (owner_id_int != current_user.id): {owner_id_int != current_user.id}")

    if owner_id_int != current_user.id:
        print(f"!!! ACESSO NEGADO (DELETE) PELO BACKEND !!!")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir este tweet."
        )

    print(f"Permissão DELETE OK. Excluindo tweet {tweet_id}...")
    db.delete(db_tweet)
    db.commit()
    # HTTP 204 não retorna corpo


# ===================== COMENTÁRIOS (sem alterações) =====================
# ... (código dos comentários) ...

@router.post("/{tweet_id}/comments/", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
# ... (função create_comment) ...
async def create_comment( tweet_id: int, comment_data: CommentCreate, current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)):
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")
    text = comment_data.text.strip()
    if not text: raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O comentário não pode ser vazio.")
    db_comment = Comment(text=text, tweet_id=tweet_id, user_id=current_user.id)
    db.add(db_comment); db.commit(); db.refresh(db_comment)
    return CommentOut.model_validate(db_comment)


@router.get("/{tweet_id}/comments/", response_model=List[CommentOut])
# ... (função read_comments) ...
async def read_comments(tweet_id: int, db: Session = Depends(get_db)):
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet: raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")
    comments = db.query(Comment).filter(Comment.tweet_id == tweet_id).all()
    return comments