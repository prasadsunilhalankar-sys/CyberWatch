from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

from datetime import datetime

class LogEventOut(BaseModel):
    id: int
    timestamp: datetime
    source_ip: str
    username: str
    event_type: str

    class Config:
        from_attributes = True