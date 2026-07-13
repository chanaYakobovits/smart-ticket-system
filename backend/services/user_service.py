import jwt
import smtplib
import secrets
import re
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os


from models.department import Department
from models.user import User
from models.userType import UserType
from schemas.department_dto import DepartmentDTO
from schemas.userType_dto import UserTypeDTO
from schemas.user_dto import UserCreateDTO, UserDTO

# הגדרות אבטחה להצפנת סיסמאות
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#SECRET_KEY = "your-very-secret-jwt-key"  # במציאות שמים בקובץ env.
#SECRET_KEY = os.getenv("SECRET_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "my-secret-key-123")
ALGORITHM = "HS256"




class UserService:

    @staticmethod
    def validate_password(password: str) -> List[str]:
        """בדיקת חוזק סיסמה. מחזירה רשימת הודעות שגיאה (ריקה = תקין)."""
        errors = []
        if not password or len(password) < 8:
            errors.append("סיסמה חייבת להכיל לפחות 8 תווים")
        if not re.search(r'[A-Z]', password):
            errors.append("סיסמה חייבת להכיל לפחות אות גדולה אחת")
        if not re.search(r'[a-z]', password):
            errors.append("סיסמה חייבת להכיל לפחות אות קטנה אחת")
        if not re.search(r'[0-9]', password):
            errors.append("סיסמה חייבת להכיל לפחות מספר אחד")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=]', password):
            errors.append("סיסמה חייבת להכיל לפחות תו מיוחד אחד")
        return errors

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def generate_token(user: UserDTO) -> str:
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": str(user.user_type_id),
            "exp": datetime.utcnow() + timedelta(hours=4)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def get_user_types(db: Session) -> List[UserTypeDTO]:
        try:
            details = db.query(UserType).all()
            if not details:
                return []
            return [UserTypeDTO.from_orm(item) for item in details]
        except Exception:
            return []

    @staticmethod
    def get_departments(db: Session) -> List[DepartmentDTO]:
        try:
            details = db.query(Department).all()
            if not details:
                return []
            return [DepartmentDTO.from_orm(item) for item in details]
        except Exception:
            return []


    # 1. פונקציית Authenticate (Login) המקורית שלך

    @classmethod
    def authenticate(cls, db: Session, employee_id_or_email: str, password: str) -> Tuple[bool, str, Optional[UserDTO]]:
        try:
            user = db.query(User).filter(User.email == employee_id_or_email).first()

            if not user:
                return False, "אימייל או סיסמה שגויים", None

            if not cls.verify_password(password, user.password_hash):
                return False, "אימייל או סיסמה שגויים", None

            user_dto = UserDTO.from_orm(user)
            print(f"🔹 user_dto: {user_dto}")
            token = cls.generate_token(user_dto)
            print(f"🔹 token: {token}")

            return True, token, user_dto
        except Exception as ex:
            print(f"❌ exception: {str(ex)}")
            return False, f"אירעה שגיאה פנימית: {str(ex)}", None
    # 2. פונקציית Add (הרשמה / הוספת משתמש)
    @classmethod
    def add(cls, db: Session, user_dto: UserCreateDTO) -> Tuple[bool, str, Optional[UserDTO]]:
        # בדיקת חוזק הסיסמה
        password_errors = cls.validate_password(user_dto.password)
        if password_errors:
            return False, " | ".join(password_errors), None

        # בדיקה אם המייל קיים
        email_exists = db.query(User).filter(User.email == user_dto.email).first()
        if email_exists:
            return False, "כתובת המייל כבר קיימת במערכת.", None

        hashed_password = cls.get_password_hash(user_dto.password)

        db_user = User(
            first_name=user_dto.first_name,
            last_name=user_dto.last_name,
            email=user_dto.email,
            employee_id=user_dto.employee_id,
            phone=user_dto.phone,
            user_type_id=user_dto.user_type_id,
            department_id=user_dto.department_id,
            job_title=user_dto.job_title,
            status=user_dto.status,
            password_hash=hashed_password
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return True, "משתמש נוסף בהצלחה.", UserDTO.from_orm(db_user)

    # 3. פונקציית ForgotPassword
    @classmethod
    def forgot_password(cls, db: Session, email: str, client_url: str) -> Tuple[bool, str]:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return True, "אם המייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה"

        # יצירת טוקן מאובטח בדומה ל-RandomNumberGenerator ב-C#
        token = secrets.token_urlsafe(64)
        user.reset_password_token = token
        user.reset_password_token_expiry = datetime.utcnow() + timedelta(minutes=15)

        db.commit()

        reset_link = f"{client_url}/reset-password?token={token}"
        cls.send_reset_email(user.email, reset_link)

        return True, "אם המייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה"

    # 4. פונקציית ResetPassword
    @classmethod
    def reset_password(cls, db: Session, token: str, new_password: str) -> Tuple[bool, str]:
        user = db.query(User).filter(User.reset_password_token == token).first()

        if not user or (user.reset_password_token_expiry and user.reset_password_token_expiry < datetime.utcnow()):
            return False, "הקישור אינו תקף או שפג תוקפו"

        user.password_hash = cls.get_password_hash(new_password)
        user.reset_password_token = None
        user.reset_password_token_expiry = None

        db.commit()
        return True, "הסיסמה עודכנה בהצלחה"

    # 5. פונקציית עזר לשליחת המייל (SendResetEmailAsync)
    @staticmethod
    def send_reset_email(to_email: str, reset_link: str):
        gmail_from = os.getenv("GMAIL_FROM")
        gmail_password = os.getenv("GMAIL_PASSWORD")
        html_body = f"""
        <div dir="rtl" style="font-family:Arial;padding:20px;max-width:500px;">
            <h2 style="color:#0067b8;">איפוס סיסמה</h2>
            <p>קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
            <p>לחץ על הכפתור להגדרת סיסמה חדשה. הקישור תקף ל-15 דקות.</p>
            <a href="{reset_link}" style="background:#0067b8;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin:20px 0;">
                איפוס סיסמה
            </a>
            <p style="color:#888;font-size:12px;margin-top:20px;">אם לא ביקשת איפוס סיסמה, התעלם מהודעה זו.</p>
        </div>
        """

        msg = MIMEText(html_body, 'html', 'utf-8')
        msg['Subject'] = "איפוס סיסמה"
        msg['From'] = gmail_from
        msg['To'] = to_email

        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(gmail_from, gmail_password)
                server.sendmail(gmail_from, [to_email], msg.as_string())
        except Exception as e:
            print(f"Failed to send email: {e}")  # לוג זמני בשרת