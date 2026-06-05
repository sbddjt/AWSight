from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.aws_client import get_boto_session, get_account_or_404
from services.costs import get_monthly_cost, get_daily_costs, get_cost_by_service

router = APIRouter(prefix="/accounts/{account_id}/costs", tags=["costs"])


@router.get("/monthly")
def monthly_cost(account_id: str, db: Session = Depends(get_db)):
    account = get_account_or_404(account_id, db)
    session = get_boto_session(account)
    return get_monthly_cost(session)


@router.get("/daily")
def daily_costs(account_id: str, days: int = 14, db: Session = Depends(get_db)):
    account = get_account_or_404(account_id, db)
    session = get_boto_session(account)
    return {"data": get_daily_costs(session, days)}


@router.get("/by-service")
def cost_by_service(account_id: str, db: Session = Depends(get_db)):
    account = get_account_or_404(account_id, db)
    session = get_boto_session(account)
    return {"data": get_cost_by_service(session)}
