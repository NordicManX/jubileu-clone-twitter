from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active = Column(Boolean, server_default='true', nullable=False)
    
    tweets = relationship("Tweet", back_populates="owner", cascade="all, delete-orphan", lazy="dynamic")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan", lazy="dynamic")

class Tweet(Base):
    __tablename__ = "tweets"
    __table_args__ = (
        Index('ix_tweets_owner_id', 'owner_id'),
        {'extend_existing': True},
    )

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    owner = relationship("User", back_populates="tweets")
    comments = relationship("Comment", back_populates="tweet", cascade="all, delete-orphan", lazy="dynamic")

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    tweet_id = Column(Integer, ForeignKey("tweets.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    tweet = relationship("Tweet", back_populates="comments")
    user = relationship("User", back_populates="comments")

class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (
        Index('ix_follows_follower_id', 'follower_id'),
        Index('ix_follows_following_id', 'following_id'),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    follower = relationship("User", foreign_keys=[follower_id], backref="following_rel")
    following = relationship("User", foreign_keys=[following_id], backref="followers_rel")
