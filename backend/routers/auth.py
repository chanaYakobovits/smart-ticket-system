from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.department_dto import DepartmentDTO
from schemas.userType_dto import UserTypeDTO
from schemas.user_dto import LoginRequest, UserCreateDTO,ForgotPasswordRequest,ResetPasswordRequest
from services.user_service import UserService
from typing import List
import os
from limiter import limiter
from fastapi import Request

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.post("/login")
@limiter.limit("5/minute")
def login(request: Request,login_data: LoginRequest, db: Session = Depends(get_db)):
    success, result, user = UserService.authenticate(db, login_data.email, login_data.password)

    if not success:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=result)
    return {
        "success": True,
        "token": result,
        "user": user
    }


@router.post("/register")
def register(request: UserCreateDTO, db: Session = Depends(get_db)):
    success, message, user = UserService.add(db, request)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"success": True, "message": message, "user": user}

@router.get("/user-types", response_model=List[UserTypeDTO])
def get_user_types(db: Session = Depends(get_db)):
    return UserService.get_user_types(db)

@router.get("/departments", response_model=List[DepartmentDTO])
def get_departments(db: Session = Depends(get_db)):
    return UserService.get_departments(db)

@router.post("/forgot-password")
@limiter.limit("3/hour")
def forgot_password(request: Request,forgot_request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    success, message = UserService.forgot_password(db, forgot_request.email, FRONTEND_URL)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"success": True, "message": message}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    success, message = UserService.reset_password(db, request.token, request.new_password)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"success": True, "message": message}