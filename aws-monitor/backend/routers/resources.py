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

router = APIRouter(prefix="/accounts/{account_id}/resources", tags=["resources"])


@router.get("")
def list_resources(account_id: str, db: Session = Depends(get_db)):
    account = get_account_or_404(account_id, db)
    session = get_boto_session(account)

    resources = []
    for fetcher in [get_ec2_instances, get_rds_instances, get_lambda_functions, get_s3_buckets]:
        try:
            resources.extend(fetcher(session))
        except Exception as e:
            pass  # 권한 없는 서비스는 스킵

    return {
        "resources": resources,
        "idle": get_idle_resources(resources),
        "summary": {
            "total": len(resources),
            "running": sum(1 for r in resources if r["state"] in ("running", "available", "active")),
            "stopped": sum(1 for r in resources if r["state"] in ("stopped", "stopping")),
        },
    }
