from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas.ticket_dto import TicketDTO, TicketCreateDTO
from services.ticket_service import TicketService

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@router.get("/user/{user_id}", response_model=List[TicketDTO])
def get_by_user(user_id: int, db: Session = Depends(get_db)):
    return TicketService.get_by_user_id(db, user_id)


@router.get("/{ticket_id}", response_model=TicketDTO)
def get_by_id(ticket_id: int, db: Session = Depends(get_db)):
    ticket = TicketService.get_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="הפנייה לא נמצאה")
    return ticket


@router.post("")
def add_ticket(dto: TicketCreateDTO, db: Session = Depends(get_db)):
    success, message, data = TicketService.add(db, dto)
    if not success:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=message)
    return {"success": True, "message": message, "data": data}