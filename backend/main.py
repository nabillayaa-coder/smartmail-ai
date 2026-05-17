from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EmailRequest(BaseModel):
    subject: str
    message: str


@app.get("/")
def home():
    return {"message": "SmartMail AI Backend Running"}


@app.post("/analyze-email")
def analyze_email(email: EmailRequest):
    text = f"{email.subject} {email.message}".lower()

    category = "Inbox"
    priority = "Low"

    if "urgent" in text or "security" in text or "password" in text:
        priority = "High"

    if "meeting" in text or "deadline" in text or "project" in text:
        priority = "Medium"

    if "crypto" in text or "win money" in text or "click here" in text or "claim" in text:
        category = "Spam"
        priority = "High"

    if "security" in text or "payment" in text or "invoice" in text:
        category = "Important"

    summary = email.message[:120]

    suggested_reply = (
        "Thank you for your email. I will review it and get back to you shortly."
    )

    return {
        "summary": summary,
        "category": category,
        "priority": priority,
        "suggested_reply": suggested_reply,
    }