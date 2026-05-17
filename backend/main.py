from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal, engine
from models import Email, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailRequest(BaseModel):
    sender: str
    subject: str
    preview: str


@app.get("/")
def home():
    return {"message": "SmartMail AI Backend Running"}


@app.get("/emails")
def get_emails():
    db: Session = SessionLocal()

    emails = db.query(Email).order_by(Email.id.desc()).all()

    db.close()

    return emails


def classify_email(subject: str, preview: str):
    text = f"{subject} {preview}".lower()

    category = "Personal"
    priority = "Low"

    if (
        "crypto" in text
        or "claim" in text
        or "click here" in text
        or "winner" in text
        or "won" in text
    ):
        category = "Spam"
        priority = "High"

    elif (
        "security" in text
        or "password" in text
        or "verification" in text
        or "login" in text
    ):
        category = "Security"
        priority = "High"

    elif (
        "payment" in text
        or "invoice" in text
        or "bank" in text
        or "salary" in text
    ):
        category = "Finance"
        priority = "High"

    elif (
        "job" in text
        or "interview" in text
        or "career" in text
        or "linkedin" in text
    ):
        category = "Career"
        priority = "Medium"

    elif (
        "netflix" in text
        or "spotify" in text
        or "movie" in text
        or "subscription" in text
    ):
        category = "Entertainment"
        priority = "Low"

    elif (
        "amazon" in text
        or "order" in text
        or "delivery" in text
        or "shipped" in text
    ):
        category = "Shopping"
        priority = "Low"

    return category, priority


@app.post("/emails")
def create_received_email(email: EmailRequest):
    db: Session = SessionLocal()

    category, priority = classify_email(email.subject, email.preview)

    new_email = Email(
        sender=email.sender,
        subject=email.subject,
        preview=email.preview,
        time="Now",
        category=category,
        priority=priority,
        unread=True,
        ai_summary=email.preview[:120],
        suggested_reply="Thank you for your email. I will review it shortly.",
    )

    db.add(new_email)
    db.commit()
    db.refresh(new_email)
    db.close()

    return new_email


@app.post("/emails/sent")
def create_sent_email(email: EmailRequest):
    db: Session = SessionLocal()

    new_email = Email(
        sender=email.sender,
        subject=email.subject,
        preview=email.preview,
        time="Now",
        category="Sent",
        priority="Low",
        unread=False,
        ai_summary=email.preview[:120],
        suggested_reply="",
    )

    db.add(new_email)
    db.commit()
    db.refresh(new_email)
    db.close()

    return new_email