from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import joinedload
from fastapi import UploadFile
from sqlalchemy.orm import Session
from services.ai_service import AIService
from models.ticket import Ticket
from schemas.ticket_dto import TicketDTO, TicketCreateDTO,TicketDetailsDTO ,MessageDTO as MessageOutputDTO
from models.aianalysis import Aianalysis
from services.attachment_service import AttachmentService
from models.message import Message
from models.ticket_assignment import TicketAssignment

class TicketService:

    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> List[TicketDTO]:
        try:
            tickets = (
                db.query(Ticket)
                .options(
                    joinedload(Ticket.ticket_assignment).joinedload(TicketAssignment.user)
                )
                .filter(Ticket.opened_by_user_id == user_id)
                .order_by(Ticket.opened_date.desc())
                .all()
            )
            return [TicketDTO.from_orm(t) for t in tickets]
        except Exception:
            return []

    @staticmethod
    def get_by_id(db: Session, ticket_id: int) -> Optional[TicketDetailsDTO]:

        ticket = (
            db.query(Ticket)
            .options(
                joinedload(Ticket.category),
                joinedload(Ticket.attachments),
                joinedload(Ticket.messages).joinedload(Message.user),
                joinedload(Ticket.ticket_assignment).joinedload(TicketAssignment.user),
                joinedload(Ticket.ticket_status_history),
                joinedload(Ticket.ai_analysis)
            )
            .filter(Ticket.id == ticket_id)
            .first()
        )

        if not ticket:
            return None

        return TicketDetailsDTO.from_orm(ticket)

    @staticmethod
    async def add(db: Session, dto: TicketCreateDTO, user_id: int, files: List[UploadFile] = None, ) -> Tuple[
        bool, str, Optional[TicketDTO], List[dict]]:
        try:
            analysis = AIService.analyze_ticket(
                db=db,
                subject=dto.subject,
                description=dto.description
            )
            now = datetime.now()
            db_ticket = Ticket(
                subject=dto.subject,
                description=dto.description,
                category_id=analysis["predictedCategoryId"],
                urgency_level=analysis["urgencyScore"],
                current_status="חדשה",
                opened_by_user_id=user_id,
                opened_date=now.date(),
                opened_time=now.time(),
            )
            db.add(db_ticket)
            db.commit()
            db.refresh(db_ticket)

            ai_analysis = Aianalysis(
                ticket_id=db_ticket.id,
                predicted_category_id=analysis["predictedCategoryId"],
                urgency_score=analysis["urgencyScore"],
                risk_level=analysis["riskLevel"],
                analysis_text=analysis["analysisText"],
                suggested_response=analysis["suggestedResponse"]
            )

            db.add(ai_analysis)
            db.commit()

            rejected_files: List[dict] = []
            if files:
                _, rejected_files = await AttachmentService.save_files(db, db_ticket.id, user_id, files)

            return True, "הפנייה נפתחה בהצלחה.", TicketDTO.from_orm(db_ticket), rejected_files
        except Exception as ex:
            db.rollback()
            import traceback
            traceback.print_exc()
            return False, str(ex), None, []

    @staticmethod
    async def add_message(
            db: Session, ticket_id: int, user_id: int, content: str, files: List[UploadFile] = None
    ) -> Tuple[bool, str, Optional[TicketDetailsDTO], List[dict]]:
        try:
            ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
            if not ticket:
                return False, "הפנייה לא נמצאה", None, []

            new_message = Message(
                ticket_id=ticket_id,
                user_id=user_id,
                content=content
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)

            rejected_files: List[dict] = []
            if files:
                _, rejected_files = await AttachmentService.save_files(
                    db, ticket_id, user_id, files, message_id=new_message.id
                )

            updated_ticket = TicketService.get_by_id(db, ticket_id)
            return True, "התגובה נוספה בהצלחה", updated_ticket, rejected_files
        except Exception as ex:
            db.rollback()
            return False, str(ex), None, []