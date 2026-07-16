from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(100), nullable=False)

    tickets = relationship("Ticket", back_populates="category")
    slas = relationship("Sla", back_populates="category")
    ai_analysis = relationship("Aianalysis",back_populates="predicted_category")