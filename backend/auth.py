import jwt
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from fastapi import HTTPException, status

# Chave secreta para assinar os tokens JWT
SECRET_KEY = "your_secret_key"  # Substitua por uma chave secreta mais segura
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Usaremos o passlib para hashear as senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Função para gerar um token JWT
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY", "secret"), algorithm="HS256")
    return encoded_jwt

# Função para verificar se a senha fornecida está correta
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Função para hashear a senha
def get_password_hash(password):
    return pwd_context.hash(password)

# Função para verificar o token JWT
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalid")
