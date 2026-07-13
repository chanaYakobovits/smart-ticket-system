from database import Base
from sqlalchemy import Column, Integer, String


class UserType(Base):
    __tablename__ = "user_types"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(50), nullable=False)