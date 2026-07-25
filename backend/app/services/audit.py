from sqlalchemy.orm import Session
from typing import Optional
from app.models.models import AuditLog

def log_action(db: Session, user_id: Optional[int], action: str, entity_type: str, entity_id: Optional[int] = None) -> AuditLog:
    audit = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit
