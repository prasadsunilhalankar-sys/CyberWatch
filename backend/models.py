from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="viewer")
    created_at = Column(DateTime, default=datetime.utcnow)

class LogEvent(Base):
    __tablename__ = "log_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime)
    source_ip = Column(String)
    username = Column(String)
    event_type = Column(String)
    raw_line = Column(String)

class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(Integer, primary_key=True, index=True)
    rule_triggered = Column(String)
    severity = Column(String)
    source_ip = Column(String)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    risk_event_id = Column(Integer, ForeignKey("risk_events.id"))
    message = Column(String)
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)