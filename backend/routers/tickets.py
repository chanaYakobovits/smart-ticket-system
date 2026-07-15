from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User
from routers.auth_dependency import get_current_user
from schemas.ticket_dto import TicketDTO, TicketCreateDTO
from services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.get("/user/{user_id}", response_model=List[TicketDTO])
def get_by_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="אין הרשאה")
    return TicketService.get_by_user_id(db, user_id)


@router.get("/{ticket_id}", response_model=TicketDTO)
def get_by_id(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)   # ← להוסיף
):
    ticket = TicketService.get_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="הפנייה לא נמצאה")
    if ticket.opened_by_user_id != current_user.id:   # ← להוסיף, בדומה ל-get_by_user
        raise HTTPException(status_code=403, detail="אין הרשאה")
    return ticket



@router.post("")
def add_ticket(
    dto: TicketCreateDTO,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dto.opened_by_user_id = current_user.id
    success, message, data = TicketService.add(db, dto)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)
    return {"success": True, "message": message, "data": data}