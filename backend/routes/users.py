from fastapi import Depends
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, constr
from sqlalchemy.orm import Session
from models import User
from database import SessionLocal
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
import os
from datetime import datetime, timedelta
import jwt
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

router = APIRouter()

# Definir oauth2_scheme para autenticação
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Criptografia de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Modelo de entrada para o cadastro de usuário
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: constr(min_length=8)  # Adiciona validação de senha mínima

# Função para verificar a senha
def hash_password(password: str):
    return pwd_context.hash(password)

# Função para verificar se o email já existe
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

# Função para obter a sessão do banco de dados
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Função para verificar a senha
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Função para criar o token JWT
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=15)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY", "secret"), algorithm="HS256")
    return encoded_jwt

# Função para autenticar o usuário
def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(password, user.password):
        # Não revelar se é o e-mail ou senha errada
        return None
    return user

# Endpoint para criar um usuário
@router.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Verifica se o usuário já existe
    db_user = get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    # Criptografa a senha
    hashed_password = hash_password(user.password)

    # Cria o usuário
    db_user = User(name=user.name, email=user.email, password=hashed_password)
    db.add(db_user)
    try:
        db.commit()
        db.refresh(db_user)
        return {"msg": "Usuário criado com sucesso", "user_id": db_user.id}
    except IntegrityError as e:
        db.rollback()
        if 'email' in str(e):
            raise HTTPException(status_code=400, detail="O email já está em uso.")
        raise HTTPException(status_code=400, detail="Erro ao criar usuário")

# Endpoint para login
@router.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = authenticate_user(db, user.email, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    # Cria o token JWT
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

# Modelo de entrada para a alteração de senha
class ChangePassword(BaseModel):
    old_password: str
    new_password: str

# Função para verificar o token JWT
def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY", "secret"), algorithms=["HS256"])
        return payload.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# Endpoint para obter o perfil do usuário
@router.get("/profile")
def get_profile(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_email = verify_jwt_token(token)
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return {"name": user.name, "email": user.email}

# Endpoint para alterar a senha
@router.put("/change-password")
def change_password(change: ChangePassword, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_email = verify_jwt_token(token)
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if not verify_password(change.old_password, user.password):
        raise HTTPException(status_code=400, detail="Senha antiga incorreta")
    
    # Criptografa a nova senha
    hashed_new_password = hash_password(change.new_password)
    user.password = hashed_new_password
    db.commit()
    return {"msg": "Senha alterada com sucesso"}
