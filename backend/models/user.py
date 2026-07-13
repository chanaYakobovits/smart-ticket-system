from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, TIMESTAMP
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
from database import Base

#Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, nullable=True)
    phone = Column(String(20))
    user_type_id = Column(Integer, nullable=False)  # ניתן לקשור לטבלת user_types בהמשך
    department_id = Column(Integer, nullable=False)
    job_title = Column(String(100))
    status = Column(String(20), default='Active')
    password_hash = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
#חסר קוד עובד?
    # שדות עבור איפוס סיסמה (forgot password) מהקוד המקורי שלך:
    reset_password_token = Column(String(255), nullable=True)
    reset_password_token_expiry = Column(DateTime, nullable=True)