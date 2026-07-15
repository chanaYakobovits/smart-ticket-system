from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from services.ai_service import AIService
from models.ticket import Ticket
from schemas.ticket_dto import TicketDTO, TicketCreateDTO
from models.aianalysis import Aianalysis

class TicketService:

    @staticmethod
    def get_by_user_id(db: Session, user_id: int) -> List[TicketDTO]:
        try:
            tickets = (
                db.query(Ticket)
                .filter(Ticket.opened_by_user_id == user_id)
                .order_by(Ticket.opened_date.desc())
                .all()
            )
            return [TicketDTO.from_orm(t) for t in tickets]
        except Exception:
            return []

    @staticmethod
    def get_by_id(db: Session, ticket_id: int) -> Optional[TicketDTO]:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        return TicketDTO.from_orm(ticket) if ticket else None

    @staticmethod
    def add(db: Session, dto: TicketCreateDTO) -> Tuple[bool, str, Optional[TicketDTO]]:

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
                current_status="פתוח",
                opened_by_user_id=dto.opened_by_user_id,
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

            return True, "הפנייה נפתחה בהצלחה.", TicketDTO.from_orm(db_ticket)
        except Exception as ex:
            db.rollback()
            import traceback
            traceback.print_exc()
            return False, str(ex), None