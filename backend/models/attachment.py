from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message_id = Column(Integer, ForeignKey("messages.id"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_url = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    file_size = Column(Integer, nullable=True)
    ticket = relationship("Ticket", back_populates="attachments")
    uploaded_by_user = relationship("User", back_populates="attachments")
    message = relationship("Message", back_populates="attachments")