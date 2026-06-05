import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services.aws_client import get_boto_session, get_account_or_404
from services.resources import (
    get_ec2_instances,
    get_rds_instances,
    get_lambda_functions,
    get_s3_buckets,
    get_idle_resources,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/accounts/{account_id}/resources", tags=["resources"])

_FETCHERS = [
    ("EC2",    get_ec2_instances),
    ("RDS",    get_rds_instances),
    ("Lambda", get_lambda_functions),
    ("S3",     get_s3_buckets),
]


@router.get("")
def list_resources(account_id: str, db: Session = Depends(get_db)):
    account = get_account_or_404(account_id, db)
    session = get_boto_session(account)

    resources = []
    for service_name, fetcher in _FETCHERS:
        try:
            resources.extend(fetcher(session))
        except Exception as exc:
            # 권한 부족 등으로 특정 서비스 조회 실패 시 스킵하고 로그만 남김
            logger.warning("Failed to fetch %s resources for account %s: %s", service_name, account_id, exc)

    return {
        "resources": resources,
        "idle": get_idle_resources(resources),
        "summary": {
            "total":   len(resources),
            "running": sum(1 for r in resources if r["state"] in {"running", "available", "active"}),
            "stopped": sum(1 for r in resources if r["state"] in {"stopped", "stopping"}),
        },
    }
