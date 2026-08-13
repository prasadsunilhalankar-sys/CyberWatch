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

class RiskEventOut(BaseModel):
    id: int
    rule_triggered: str
    severity: str
    source_ip: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True