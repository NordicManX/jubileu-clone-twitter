from pydantic import BaseModel

# Definição do modelo para criação de tweet
class TweetCreate(BaseModel):
    content: str
    owner_id: int

    class Config:
        orm_mode = True

# Definição do modelo para saída de tweet (apenas leitura)
class TweetOut(BaseModel):
    id: int
    content: str
    owner_id: int

    class Config:
        orm_mode = True
