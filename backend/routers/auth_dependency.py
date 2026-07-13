from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from services.user_service import SECRET_KEY, ALGORITHM
from sqlalchemy.orm import Session
from database import get_db
from models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "טוקן לא תקין")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "פג תוקף ההתחברות, יש להתחבר מחדש")
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "טוקן לא תקין")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "משתמש לא נמצא")
    return user

def require_user_type(*allowed_type_ids: int):
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.user_type_id not in allowed_type_ids:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "אין הרשאה לפעולה זו")
        return current_user
    return checker

def require_role(allowed_roles: list[str]):
    async def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.user_type.name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FOR_VALIDATION_ERROR,
                detail="אין לך הרשאה לבצע פעולה זו"
            )
        return current_user
    return role_checker