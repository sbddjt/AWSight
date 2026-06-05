from datetime import datetime, timezone
from typing import Any
import boto3


def get_ec2_instances(session: boto3.Session) -> list[dict[str, Any]]:
    ec2 = session.client("ec2")
    response = ec2.describe_instances()
    instances = []
    for reservation in response["Reservations"]:
        for inst in reservation["Instances"]:
            name = next(
                (t["Value"] for t in inst.get("Tags", []) if t["Key"] == "Name"), "-"
            )
            launch_time = inst.get("LaunchTime")
            running_days = None
            if launch_time and inst["State"]["Name"] == "running":
                running_days = (datetime.now(timezone.utc) - launch_time).days

            instances.append({
                "id": inst["InstanceId"],
                "type": "EC2",
                "name": name,
                "state": inst["State"]["Name"],
                "instance_type": inst.get("InstanceType"),
                "region": session.region_name,
                "launch_time": launch_time.isoformat() if launch_time else None,
                "running_days": running_days,
            })
    return instances


def get_rds_instances(session: boto3.Session) -> list[dict[str, Any]]:
    rds = session.client("rds")
    response = rds.describe_db_instances()
    result = []
    for db in response["DBInstances"]:
        create_time = db.get("InstanceCreateTime")
        running_days = None
        if create_time and db["DBInstanceStatus"] == "available":
            running_days = (datetime.now(timezone.utc) - create_time).days

        result.append({
            "id": db["DBInstanceIdentifier"],
            "type": "RDS",
            "name": db["DBInstanceIdentifier"],
            "state": db["DBInstanceStatus"],
            "instance_type": db.get("DBInstanceClass"),
            "region": session.region_name,
            "launch_time": create_time.isoformat() if create_time else None,
            "running_days": running_days,
            "engine": db.get("Engine"),
        })
    return result


def get_lambda_functions(session: boto3.Session) -> list[dict[str, Any]]:
    lmb = session.client("lambda")
    response = lmb.list_functions()
    result = []
    for fn in response["Functions"]:
        result.append({
            "id": fn["FunctionArn"],
            "type": "Lambda",
            "name": fn["FunctionName"],
            "state": "active",
            "instance_type": fn.get("Runtime"),
            "region": session.region_name,
            "launch_time": fn.get("LastModified"),
            "running_days": None,
            "memory": fn.get("MemorySize"),
        })
    return result


def get_s3_buckets(session: boto3.Session) -> list[dict[str, Any]]:
    s3 = session.client("s3")
    response = s3.list_buckets()
    result = []
    for bucket in response.get("Buckets", []):
        created = bucket.get("CreationDate")
        result.append({
            "id": bucket["Name"],
            "type": "S3",
            "name": bucket["Name"],
            "state": "active",
            "instance_type": None,
            "region": "global",
            "launch_time": created.isoformat() if created else None,
            "running_days": None,
        })
    return result


def get_idle_resources(resources: list[dict]) -> list[dict]:
    idle = []
    for r in resources:
        days = r.get("running_days")
        if r["type"] == "EC2" and r["state"] == "running" and days and days >= 30:
            idle.append({**r, "reason": f"{days}일째 실행 중인 EC2 인스턴스"})
        elif r["type"] == "RDS" and r["state"] == "available" and days and days >= 14:
            idle.append({**r, "reason": f"{days}일째 실행 중인 RDS 인스턴스"})
    return idle
