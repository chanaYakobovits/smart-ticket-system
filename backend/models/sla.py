from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Sla(Base):
    __tablename__ = "slas"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    urgency_level = Column(Integer, nullable=False)
    target_response_hours = Column(Integer, nullable=False)

    category = relationship("Category", back_populates="slas")