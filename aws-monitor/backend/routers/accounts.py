from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import uuid
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

from database import get_db, AccountModel
from crypto import encrypt, decrypt

router = APIRouter(prefix="/accounts", tags=["accounts"])


class AccountCreate(BaseModel):
    name: str
    access_key: str
    secret_key: str
    region: str = "ap-northeast-2"


class AccountResponse(BaseModel):
    id: str
    name: str
    region: str
    access_key_preview: str

    class Config:
        from_attributes = True


@router.get("", response_model=List[AccountResponse])
def list_accounts(db: Session = Depends(get_db)):
    accounts = db.query(AccountModel).all()
    return [
        AccountResponse(
            id=a.id,
            name=a.name,
            region=a.region,
            access_key_preview=decrypt(a.encrypted_access_key)[:8] + "****",
        )
        for a in accounts
    ]


@router.post("", response_model=AccountResponse)
def create_account(body: AccountCreate, db: Session = Depends(get_db)):
    # IAM 자격증명 유효성 검사
    try:
        sts = boto3.client(
            "sts",
            aws_access_key_id=body.access_key,
            aws_secret_access_key=body.secret_key,
            region_name=body.region,
        )
        sts.get_caller_identity()
    except (ClientError, NoCredentialsError) as e:
        raise HTTPException(status_code=400, detail=f"유효하지 않은 자격증명: {str(e)}")

    account = AccountModel(
        id=str(uuid.uuid4()),
        name=body.name,
        encrypted_access_key=encrypt(body.access_key),
        encrypted_secret_key=encrypt(body.secret_key),
        region=body.region,
    )
    db.add(account)
    db.commit()
    db.refresh(account)

    return AccountResponse(
        id=account.id,
        name=account.name,
        region=account.region,
        access_key_preview=body.access_key[:8] + "****",
    )


@router.delete("/{account_id}")
def delete_account(account_id: str, db: Session = Depends(get_db)):
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="계정을 찾을 수 없습니다")
    db.delete(account)
    db.commit()
    return {"message": "삭제되었습니다"}
