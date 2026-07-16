from fastapi import APIRouter, Depends, HTTPException, status, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User
from routers.auth_dependency import get_current_user
from schemas.ticket_dto import TicketDTO, TicketCreateDTO, TicketDetailsDTO
from services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.get("/user/{user_id}", response_model=List[TicketDTO])
def get_by_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="אין הרשאה")
    return TicketService.get_by_user_id(db, user_id)


@router.get("/{ticket_id}", response_model=TicketDetailsDTO)
def get_by_id(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ticket = TicketService.get_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="הפנייה לא נמצאה")
    if ticket.opened_by_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="אין הרשאה")
    return ticket



@router.post("")
async def add_ticket(
    subject: Optional[str] = Form(None),
    description: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    dto = TicketCreateDTO(subject=subject, description=description)
    success, message, data = await TicketService.add(db, dto, current_user.id, files)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)
    return {"success": True, "message": message, "data": data}