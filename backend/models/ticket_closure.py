from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class TicketClosure(Base):
    __tablename__ = "ticket_closures"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), unique=True, nullable=False)
    closed_at = Column(DateTime, default=datetime.utcnow)
    closure_reason = Column(String(255), nullable=False)
    summary = Column(String, nullable=False)

    ticket = relationship("Ticket", back_populates="ticket_closure", uselist=False)