from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import timedelta
from collections import defaultdict

from models import LogEvent, RiskEvent, Alert

FAILED_LOGIN_THRESHOLD = 5
TIME_WINDOW_MINUTES = 5


def run_brute_force_detection(db: Session):
    failed_logins = (
        db.query(LogEvent)
        .filter(LogEvent.event_type == "login_failed")
        .order_by(LogEvent.source_ip, LogEvent.timestamp)
        .all()
    )

    ip_groups = defaultdict(list)
    for event in failed_logins:
        ip_groups[event.source_ip].append(event.timestamp)

    new_risk_events = []

    for ip, timestamps in ip_groups.items():
        timestamps.sort()
        count_in_window = 1
        window_start = timestamps[0]

        for i in range(1, len(timestamps)):
            if (timestamps[i] - window_start) <= timedelta(minutes=TIME_WINDOW_MINUTES):
                count_in_window += 1
            else:
                count_in_window = 1
                window_start = timestamps[i]

            if count_in_window >= FAILED_LOGIN_THRESHOLD:
                existing = (
                    db.query(RiskEvent)
                    .filter(RiskEvent.source_ip == ip, RiskEvent.rule_triggered == "brute_force_login")
                    .first()
                )
                if not existing:
                    risk = RiskEvent(
                        rule_triggered="brute_force_login",
                        severity="High",
                        source_ip=ip,
                        description=f"{count_in_window} failed login attempts from {ip} within {TIME_WINDOW_MINUTES} minutes"
                    )
                    db.add(risk)
                    db.flush()
                    new_risk_events.append(risk)

                    alert = Alert(
                        risk_event_id=risk.id,
                        message=f"New High severity alert: {risk.description}"
                    )
                    db.add(alert)
                break

    db.commit()
    return new_risk_events