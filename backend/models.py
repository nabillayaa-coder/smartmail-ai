from sqlalchemy import Column, Integer, String, Boolean
from database import Base


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)

    sender = Column(String)
    subject = Column(String)
    preview = Column(String)

    time = Column(String)

    category = Column(String)

    priority = Column(String)

    unread = Column(Boolean, default=True)

    ai_summary = Column(String)

    suggested_reply = Column(String)