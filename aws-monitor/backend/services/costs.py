from datetime import datetime, timedelta
import boto3


def get_monthly_cost(session: boto3.Session) -> dict:
    ce = session.client("ce", region_name="us-east-1")
    today = datetime.utcnow().date()
    start = today.replace(day=1).isoformat()
    end = today.isoformat()

    response = ce.get_cost_and_usage(
        TimePeriod={"Start": start, "End": end},
        Granularity="MONTHLY",
        Metrics=["UnblendedCost"],
    )

    total = 0.0
    if response["ResultsByTime"]:
        total = float(response["ResultsByTime"][0]["Total"]["UnblendedCost"]["Amount"])

    return {"month": start[:7], "total_usd": round(total, 2)}


def get_daily_costs(session: boto3.Session, days: int = 14) -> list[dict]:
    ce = session.client("ce", region_name="us-east-1")
    today = datetime.utcnow().date()
    start = (today - timedelta(days=days)).isoformat()
    end = today.isoformat()

    response = ce.get_cost_and_usage(
        TimePeriod={"Start": start, "End": end},
        Granularity="DAILY",
        Metrics=["UnblendedCost"],
    )

    return [
        {
            "date": r["TimePeriod"]["Start"],
            "cost_usd": round(float(r["Total"]["UnblendedCost"]["Amount"]), 4),
        }
        for r in response["ResultsByTime"]
    ]


def get_cost_by_service(session: boto3.Session) -> list[dict]:
    ce = session.client("ce", region_name="us-east-1")
    today = datetime.utcnow().date()
    start = today.replace(day=1).isoformat()
    end = today.isoformat()

    response = ce.get_cost_and_usage(
        TimePeriod={"Start": start, "End": end},
        Granularity="MONTHLY",
        Metrics=["UnblendedCost"],
        GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}],
    )

    results = []
    if response["ResultsByTime"]:
        for group in response["ResultsByTime"][0]["Groups"]:
            cost = float(group["Metrics"]["UnblendedCost"]["Amount"])
            if cost > 0.001:
                results.append({
                    "service": group["Keys"][0],
                    "cost_usd": round(cost, 4),
                })
    return sorted(results, key=lambda x: x["cost_usd"], reverse=True)
