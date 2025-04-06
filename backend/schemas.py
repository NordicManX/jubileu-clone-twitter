from pydantic import BaseModel, ConfigDict, Field, EmailStr
from datetime import datetime
from typing import Optional, List

# ----------------------------
# Modelos de Usuário
# ----------------------------

class UserBase(BaseModel):
    email: EmailStr = Field(..., example="usuario@example.com")

class UserCreate(UserBase):
    name: str = Field(..., min_length=2, max_length=100, example="Fulano da Silva")
    password: str = Field(..., min_length=8, max_length=128, example="senhasegura123")

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100, example="Novo Nome")
    password: Optional[str] = Field(None, min_length=8, max_length=128, example="novasenha123")
    email: Optional[EmailStr] = Field(None, example="novoemail@exemplo.com")  # <- adiciona isso aqui

class UserOut(UserBase):
    id: int = Field(..., example=1)
    name: str
    created_at: datetime = Field(..., example="2023-01-01T00:00:00Z")
    # Removido updated_at que não existe no banco
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "description": "Modelo completo de saída para usuário"
        }
    )

# ----------------------------
# Modelos de Tweet
# ----------------------------

class TweetBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000, example="Conteúdo do tweet")

class TweetCreate(TweetBase):
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "description": "Modelo para criação de novos tweets"
        }
    )

class TweetUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=1000)

class TweetOut(TweetBase):
    id: int = Field(..., example=1)
    owner_id: int = Field(..., example=1)
    created_at: datetime = Field(..., example="2023-01-01T00:00:00Z")
    # Removido updated_at do tweet se não existir no banco
    owner: 'UserOut'  # Usando string para evitar referência circular
    created_at: datetime
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "description": "Modelo completo de saída para tweets incluindo informações do autor"
        }
    )

class TweetSimpleOut(BaseModel):
    id: int
    content: str
    created_at: datetime
    owner_id: int
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "description": "Modelo simplificado para listagem de tweets"
        }
    )

# ----------------------------
# Modelos de Autenticação
# ----------------------------

class Token(BaseModel):
    access_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    token_type: str = Field(default="bearer", example="bearer")

class TokenData(BaseModel):
    email: Optional[str] = None

# ----------------------------
# Modelos para Relacionamentos
# ----------------------------

class UserWithTweets(UserOut):
    tweets: List[TweetSimpleOut] = Field(default_factory=list)
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "description": "Modelo de usuário incluindo seus tweets"
        }
    )

# Resolve a referência circular após a definição
TweetOut.update_forward_refs()