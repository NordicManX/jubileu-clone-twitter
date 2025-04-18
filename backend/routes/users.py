from datetime import datetime, timedelta
from typing import Optional, Annotated
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import logging
import os
from dotenv import load_dotenv

from ..models import User
from database import get_db
from schemas import UserOut, UserUpdate

# Configuração básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

router = APIRouter(prefix="/api/users", tags=["Users"])

# Configurações
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    logger.error("SECRET_KEY não configurada nas variáveis de ambiente")
    raise ValueError("SECRET_KEY não configurada nas variáveis de ambiente")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Configuração de segurança
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/users/login")

# Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChangePassword(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)

# Funções auxiliares
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    logger.debug(f"Buscando usuário pelo email: {email}")
    return db.query(User).filter(User.email == email).first()

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    logger.debug(f"Autenticando usuário: {email}")
    user = get_user_by_email(db, email)
    if not user:
        logger.warning(f"Usuário não encontrado: {email}")
        return None
    if not pwd_context.verify(password, user.password):
        logger.warning(f"Senha incorreta para o usuário: {email}")
        return None
    logger.info(f"Usuário autenticado com sucesso: {email}")
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.debug(f"Token JWT criado para: {data.get('sub')}")
    return encoded_jwt

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
) -> User:
    logger.debug("Validando token JWT...")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            logger.warning("Token inválido: sub (email) ausente")
            raise credentials_exception
        logger.debug(f"Token decodificado com sucesso. Email: {email}")
    except JWTError as e:
        logger.error(f"Erro ao decodificar token JWT: {e}")
        raise credentials_exception

    user = get_user_by_email(db, email)
    if user is None:
        logger.warning(f"Usuário não encontrado no banco para o email: {email}")
        raise credentials_exception

    logger.info(f"Usuário autenticado com sucesso: {user.email}")
    return user

# Rotas
@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    logger.info(f"Requisição de registro recebida. IP: {request.client.host}")
    logger.debug(f"Dados recebidos: {user.dict()}")

    db_user = get_user_by_email(db, user.email)
    if db_user:
        logger.warning(f"Tentativa de registro com email já cadastrado: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    try:
        hashed_password = pwd_context.hash(user.password)
        db_user = User(
            name=user.name,
            email=user.email,
            password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"Usuário registrado com sucesso: {user.email}")
        return db_user
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Erro de integridade ao registrar usuário: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Erro ao criar usuário"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Erro inesperado ao registrar usuário: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno no servidor"
        )

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "email": user.email,
            "id": user.id
        }
    }

@router.post("/login-json", response_model=Token)
async def login_with_json(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "email": user.email,
            "id": user.id
        }
    }

@router.get("/me", response_model=UserOut)
async def read_users_me(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)]
):
    logger.info(f"Requisição para perfil do usuário autenticado: {current_user.email}")
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat()
    }

@router.put("/me", response_model=UserOut)
async def update_user_info(
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    if user_data.email:
        db_user = get_user_by_email(db, user_data.email)
        if db_user and db_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O email fornecido já está em uso por outro usuário."
            )

    if user_data.name:
        current_user.name = user_data.name
    if user_data.email:
        current_user.email = user_data.email
    if user_data.password:
        current_user.password = pwd_context.hash(user_data.password)

    db.commit()
    db.refresh(current_user)

    return current_user
