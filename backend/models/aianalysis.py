from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Aianalysis(Base):
    __tablename__ = "ai_analyses"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    predicted_category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    urgency_score = Column(Numeric(3, 1), nullable=False)
    risk_level = Column(String(20), nullable=False)
    analysis_text = Column(String, nullable=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    suggested_response = Column(String, nullable=True)

    ticket = relationship("Ticket", back_populates="aianalyses")
    predicted_category = relationship("Category", back_populates="aianalyses")