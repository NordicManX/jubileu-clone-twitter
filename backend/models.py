from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Index  # Adicione Index aqui
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}  # Adicionado para evitar redefinição da tabela

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active = Column(Boolean, server_default='true', nullable=False)
    
    tweets = relationship("Tweet", back_populates="owner", cascade="all, delete-orphan", lazy="dynamic")

class Tweet(Base):
    __tablename__ = "tweets"
    __table_args__ = {'extend_existing': True}  # Adicionado para evitar redefinição da tabela

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Índices
    __table_args__ = (
        Index('ix_tweets_owner_id', 'owner_id'),
        {'extend_existing': True},  # Para garantir que a tabela não seja redefinida
    )
    
    owner = relationship("User", back_populates="tweets")
