from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from database import init_db
from routers import accounts, resources, costs

app = FastAPI(title="AWS Monitor", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:80"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# /metrics 엔드포인트 자동 등록 — Prometheus가 여기를 스크랩함
Instrumentator().instrument(app).expose(app)

app.include_router(accounts.router)
app.include_router(resources.router)
app.include_router(costs.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
