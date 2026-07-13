from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, TIMESTAMP
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=True)
    phone = Column(String(20))
    user_type_id = Column(Integer, nullable=False)
    department_id = Column(Integer, nullable=False)
    job_title = Column(String(100))
    status = Column(String(20), default='Active')
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    reset_password_token = Column(String(255), nullable=True)
    reset_password_token_expiry = Column(DateTime, nullable=True)

    tickets = relationship("Ticket", back_populates="opened_by_user")
    attachments = relationship("Attachment", back_populates="uploaded_by_user")
    messages = relationship("Message", back_populates="user")
    ticket_assignments = relationship("TicketAssignment", back_populates="user")
    ticket_status_histories = relationship("TicketStatusHistory", back_populates="changed_by_user")