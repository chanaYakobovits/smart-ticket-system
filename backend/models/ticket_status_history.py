from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class TicketStatusHistory(Base):
    __tablename__ = "ticket_status_histories"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    previous_status = Column(String(50), nullable=False)
    new_status = Column(String(50), nullable=False)
    changed_at = Column(DateTime, default=datetime.utcnow)
    changed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    comment = Column(String, nullable=True)

    ticket = relationship("Ticket", back_populates="ticket_status_histories")
    changed_by_user = relationship("User", back_populates="ticket_status_histories")