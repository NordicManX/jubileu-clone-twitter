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

router = APIRouter(prefix="/tweets", tags=["Tweets"]) # Mantido /tweets como prefixo


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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O conteúdo do tweet não pode ser vazio."
        )
    db_tweet = Tweet(
        content=content,
        owner_id=current_user.id, # Associa ao usuário do token
        created_at=datetime.utcnow()
    )
    db.add(db_tweet)
    db.commit()
    db.refresh(db_tweet)
    # Usando model_validate para Pydantic v2 (se aplicável)
    # ou TweetOut.from_orm(db_tweet) para Pydantic v1
    return TweetOut.model_validate(db_tweet)


@router.get("/", response_model=List[TweetOut])
async def read_tweets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Lista todos os tweets com paginação."""
    tweets = (
        db.query(Tweet)
        .order_by(Tweet.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    # Nota: Não levanta 404 se a lista estiver vazia, retorna lista vazia (comportamento comum)
    # if not tweets:
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nenhum tweet encontrado.")
    return tweets


@router.get("/{tweet_id}", response_model=TweetOut)
async def read_tweet(
    tweet_id: int,
    db: Session = Depends(get_db)
):
    """Obtém um tweet específico pelo ID."""
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")
    return db_tweet


@router.put("/{tweet_id}", response_model=TweetOut)
async def update_tweet(
    tweet_id: int,
    tweet_data: TweetUpdate, # Recebe apenas o conteúdo a ser atualizado
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Atualiza um tweet pelo ID, se for do usuário autenticado."""
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()

    if not db_tweet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")

    # <<< LOGS DE DIAGNÓSTICO PARA EDIÇÃO >>>
    print(f"--- CHECK PERMISSÃO UPDATE TWEET (BACKEND) ---")
    print(f"Tweet ID Recebido: {tweet_id}")
    print(f"ID Usuário Atual (do Token): {current_user.id} (Tipo: {type(current_user.id)})")
    print(f"ID Dono do Tweet (do DB): {db_tweet.owner_id} (Tipo: {type(db_tweet.owner_id)})")
    print(f"Resultado da Comparação (owner_id != current_user.id): {db_tweet.owner_id != current_user.id}")
    # <<< FIM DOS LOGS >>>

    if db_tweet.owner_id != current_user.id:
        print(f"!!! ACESSO NEGADO (UPDATE) PELO BACKEND !!!")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, # Corrigido para 403
            detail="Você não tem permissão para editar este tweet."
        )

    # Atualiza o conteúdo
    new_content = tweet_data.content.strip()
    if not new_content:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O conteúdo do tweet não pode ser vazio.")
    db_tweet.content = new_content
    # Opcional: atualizar timestamp de modificação se houver no modelo
    # db_tweet.updated_at = datetime.utcnow()
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
        # Retorna 204 mesmo se não encontrado para não vazar informação (opcional)
        # Ou mantém o 404 se preferir indicar que não existia
         print(f"Tentativa de deletar tweet {tweet_id} não encontrado.")
         # raise HTTPException(status_code=404, detail="Tweet não encontrado.")
         return # Retorna silenciosamente com 204 (ou outra estratégia)

    # <<< LOGS DE DIAGNÓSTICO PARA EXCLUSÃO >>>
    print(f"--- CHECK PERMISSÃO DELETE TWEET (BACKEND) ---")
    print(f"Tweet ID Recebido: {tweet_id}")
    print(f"ID Usuário Atual (do Token): {current_user.id} (Tipo: {type(current_user.id)})")
    print(f"ID Dono do Tweet (do DB): {db_tweet.owner_id} (Tipo: {type(db_tweet.owner_id)})")
    print(f"Resultado da Comparação (owner_id != current_user.id): {db_tweet.owner_id != current_user.id}")
    # <<< FIM DOS LOGS >>>

    if db_tweet.owner_id != current_user.id:
        print(f"!!! ACESSO NEGADO (DELETE) PELO BACKEND !!!")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, # Corrigido para 403
            detail="Você não tem permissão para excluir este tweet."
        )

    print(f"Permissão DELETE OK. Excluindo tweet {tweet_id}...")
    db.delete(db_tweet)
    db.commit()
    # HTTP 204 não deve retornar corpo


# ===================== COMENTÁRIOS (sem alterações) =====================

@router.post("/{tweet_id}/comments/", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
async def create_comment(
    tweet_id: int,
    comment_data: CommentCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """Cria um comentário em um tweet específico."""
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")
    text = comment_data.text.strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="O comentário não pode ser vazio.")
    db_comment = Comment(
        text=text,
        tweet_id=tweet_id,
        user_id=current_user.id # Associa ao usuário do token
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return CommentOut.model_validate(db_comment)


@router.get("/{tweet_id}/comments/", response_model=List[CommentOut])
async def read_comments(
    tweet_id: int,
    db: Session = Depends(get_db)
):
    """Lista todos os comentários de um tweet."""
    db_tweet = db.query(Tweet).filter(Tweet.id == tweet_id).first()
    if not db_tweet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tweet não encontrado.")
    comments = db.query(Comment).filter(Comment.tweet_id == tweet_id).all()
    return comments