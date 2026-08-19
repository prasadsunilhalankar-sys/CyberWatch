from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io
from fastapi.responses import StreamingResponse
from database import Base, engine, get_db
from models import User, LogEvent, RiskEvent, Alert
from schemas import UserCreate, UserLogin, Token, LogEventOut, RiskEventOut, AlertOut
from auth import hash_password, verify_password, create_access_token, get_current_user, require_admin
from detection import run_brute_force_detection

Base.metadata.create_all(bind=engine)

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/run-detection")
def run_detection(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    new_events = run_brute_force_detection(db)
    return {"message": f"{len(new_events)} new risk event(s) detected"}


@app.get("/risk-events", response_model=list[RiskEventOut])
def get_risk_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(RiskEvent).all()

@app.get("/alerts", response_model=list[AlertOut])
def get_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Alert).filter(Alert.is_read == 0).order_by(Alert.created_at.desc()).all()


@app.post("/alerts/{alert_id}/mark-read")
def mark_alert_read(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.is_read = 1
    db.commit()
    return {"message": "Alert marked as read"}

@app.get("/export/csv")
def export_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    events = db.query(RiskEvent).all()

    data = [{
        "ID": e.id,
        "Rule Triggered": e.rule_triggered,
        "Severity": e.severity,
        "Source IP": e.source_ip,
        "Description": e.description,
        "Created At": e.created_at
    } for e in events]

    df = pd.DataFrame(data)

    stream = io.StringIO()
    df.to_csv(stream, index=False)

    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=risk_events_report.csv"
    return response