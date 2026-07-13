from database import Base
from sqlalchemy import Column, Integer, String

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    department_name = Column(String(100), nullable=False)
