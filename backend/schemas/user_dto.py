from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ה-DTO הכללי של משתמש שמחזירים לפרונטאנד (ללא סיסמה!)
class UserDTO(BaseModel):
    id: Optional[int] = None
    first_name: str
    last_name: str
    email: EmailStr
    employee_id: Optional[str] = None
    phone: Optional[str] = None
    user_type_id: int
    department_id: int
    job_title: Optional[str] = None
    status: str = "Active"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True # מאפשר ל-Pydantic לקרוא ישירות ממודל ה-SQLAlchemy

# DTO עבור בקשת התחברות (Login Request)
class LoginRequest(BaseModel):
    email: str
    password: str

# DTO עבור יצירת משתמש חדש (מכיל סיסמה)
class UserCreateDTO(UserDTO):
    password: str
    employee_id: str

# DTO עבור בקשת איפוס סיסמה
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str