from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Ticket(Base):
    __tablename__ = 'tickets'

    id = Column(Integer, primary_key=True, index=True)
    opened_date = Column(Date, nullable=False)
    opened_time = Column(Time, nullable=False)
    subject = Column(String(200), nullable=True)
    description = Column(String, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    urgency_level = Column(Integer, nullable=False, default=1)
    current_status = Column(String(50), nullable=False, default='פתוח')
    opened_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    category = relationship("Category", back_populates="tickets")
    opened_by_user = relationship("User", back_populates="tickets")
    attachments = relationship("Attachment", back_populates="ticket")
    messages = relationship("Message", back_populates="ticket")
    ticket_assignments = relationship("TicketAssignment", back_populates="ticket")
    ticket_status_histories = relationship("TicketStatusHistory", back_populates="ticket")
    ticket_closure = relationship("TicketClosure", back_populates="ticket", uselist=False)
    aianalyses = relationship("Aianalysis", back_populates="ticket")