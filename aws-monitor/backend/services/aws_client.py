import boto3
from sqlalchemy.orm import Session
from database import AccountModel
from crypto import decrypt


def get_boto_session(account: AccountModel) -> boto3.Session:
    return boto3.Session(
        aws_access_key_id=decrypt(account.encrypted_access_key),
        aws_secret_access_key=decrypt(account.encrypted_secret_key),
        region_name=account.region,
    )


def get_account_or_404(account_id: str, db: Session) -> AccountModel:
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="계정을 찾을 수 없습니다")
    return account
