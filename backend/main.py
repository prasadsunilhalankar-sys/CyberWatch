from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io

from database import Base, engine, get_db
from models import User, LogEvent
from schemas import UserCreate, UserLogin, Token, LogEventOut
from auth import hash_password, verify_password, create_access_token, get_current_user, require_admin

Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "CyberWatch backend is running"}


@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = User(
        username=user.username,
        password_hash=hash_password(user.password),
        role="viewer"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "username": new_user.username}


@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()

    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token({"sub": db_user.username, "role": db_user.role})
    return {"access_token": token, "token_type": "bearer"}
@app.get("/admin-only")
def admin_only_route(current_user=Depends(require_admin)):
    return {"message": f"Welcome admin {current_user.username}, you have access."}


@app.get("/me")
def get_my_profile(current_user=Depends(get_current_user)):
    return {"username": current_user.username, "role": current_user.role}

@app.post("/upload-logs")
async def upload_logs(
    file: UploadFile = File(...),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    required_columns = {"timestamp", "source_ip", "username", "event_type"}
    if not required_columns.issubset(set(df.columns)):
        raise HTTPException(status_code=400, detail=f"CSV must contain columns: {required_columns}")

    count = 0
    for _, row in df.iterrows():
        log_event = LogEvent(
            timestamp=pd.to_datetime(row["timestamp"]),
            source_ip=str(row["source_ip"]),
            username=str(row["username"]),
            event_type=str(row["event_type"]),
            raw_line=str(row.to_dict())
        )
        db.add(log_event)
        count += 1

    db.commit()
    return {"message": f"{count} log events uploaded successfully"}