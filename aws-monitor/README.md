<div align="center">

# ☁️ AWS Monitor

**AWS 콘솔보다 간결하게 — 내 리소스와 비용을 한눈에**

[![CI](https://github.com/sbddjt/AWSight/actions/workflows/ci.yml/badge.svg)](https://github.com/sbddjt/AWSight/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

</div>
---

## 왜 만들었나

AWS 콘솔은 수백 개의 서비스가 뒤섞여 있어서 **지금 뭐가 켜져 있는지, 얼마가 나왔는지** 파악하기 어렵습니다.
특히 팀 프로젝트에서 공용 계정을 사용할 때 누가 EC2를 안 끄고 갔는지, 이번 달 비용이 얼마인지 한눈에 보고 싶었습니다.

이 앱은 IAM Access Key 하나만 등록하면 **리소스 현황 · 비용 · 장기 실행 경고**를 깔끔한 대시보드로 보여줍니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 📊 리소스 대시보드 | EC2, RDS, Lambda, S3 상태를 한 화면에 |
| 💰 비용 추적 | 이달 총액 · 일별 그래프 · 서비스별 파이 차트 |
| ⚠️ 장기 실행 경고 | 30일↑ EC2, 14일↑ RDS를 자동 감지해 경고 |
| 🔑 멀티 계정 | AWS 계정 여러 개 등록 · 전환 가능 |
| 🔒 로컬 암호화 | Access Key는 Fernet으로 암호화해 로컬 DB에만 저장 |
| 📈 앱 모니터링 | Prometheus + Grafana로 API 상태 실시간 추적 |

---

## 기술 스택

```
Frontend    React 18 · TypeScript · Vite · Tailwind CSS · Recharts
Backend     Python 3.12 · FastAPI · boto3 · SQLite · SQLAlchemy
Security    Fernet (cryptography) 로컬 암호화
DevOps      Docker Compose · GitHub Actions CI · Prometheus · Grafana
```

---

## 빠른 시작 (Docker)

```bash
git clone https://github.com/sbddjt16/aws-monitor.git
cd aws-monitor
docker compose up -d --build
```

| 서비스 | 주소 | 설명 |
|--------|------|------|
| 앱 | http://localhost | 메인 대시보드 |
| Grafana | http://localhost:3000 | API 모니터링 (admin/admin) |
| Prometheus | http://localhost:9090 | 메트릭 원본 |

---

## 로컬 개발 환경

Docker 없이 바로 실행할 수 있습니다. **터미널 2개** 열어서 각각 실행:

```bash
# 터미널 1 — 백엔드
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000
```

```bash
# 터미널 2 — 프론트엔드
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## AWS IAM 설정

### 1. IAM 사용자 생성

AWS 콘솔 → IAM → 사용자 → 사용자 생성 → 아래 정책 2개 추가

```
ReadOnlyAccess           ← EC2, RDS, Lambda, S3 조회
AWSBillingReadOnlyAccess ← 비용 데이터 조회
```

### 2. 액세스 키 발급

IAM → 사용자 → 보안 자격 증명 탭 → 액세스 키 만들기
→ **Access Key ID** 와 **Secret Access Key** 복사

> Secret Access Key는 이 화면에서만 확인 가능합니다. 반드시 바로 복사해두세요.

### 3. Cost Explorer 활성화 (계정 최초 1회)

루트 계정으로 로그인 → Billing and Cost Management → Cost Explorer → Launch Cost Explorer

### 4. 앱에 등록

앱 실행 후 **계정 관리** 페이지 → 계정 추가 → 키 입력

> 등록된 키는 **Fernet 암호화**되어 로컬 SQLite에만 저장됩니다. 외부로 전송되지 않습니다.

---

## 장기 실행 경고 기준

| 리소스 | 경고 조건 | 이유 |
|--------|----------|------|
| EC2 | running 상태 30일 이상 | 대부분의 작업성 인스턴스는 30일 이상 켤 이유가 없음 |
| RDS | available 상태 14일 이상 | 개발용 DB는 사용 안 할 때 중지해야 비용 절감 |

---

## 프로젝트 구조

```
aws-monitor/
├── backend/
│   ├── main.py               # FastAPI 앱 + lifespan
│   ├── config.py             # 환경변수 기반 설정
│   ├── database.py           # SQLAlchemy 모델 + 세션
│   ├── crypto.py             # Fernet 암호화/복호화
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── routers/
│   │   ├── accounts.py       # 계정 CRUD + STS 자격증명 검증
│   │   ├── resources.py      # EC2/RDS/Lambda/S3 조회
│   │   └── costs.py          # Cost Explorer 쿼리
│   └── services/
│       ├── aws_client.py     # boto3 세션 팩토리
│       ├── resources.py      # AWS API 호출 로직
│       └── costs.py          # 비용 집계 로직
├── frontend/
│   ├── Dockerfile            # 멀티스테이지 빌드 (Node → Nginx)
│   ├── nginx.conf            # SPA 라우팅 + API 프록시
│   └── src/
│       ├── App.tsx
│       ├── pages/
│       │   ├── DashboardPage.tsx
│       │   ├── AccountsPage.tsx
│       │   ├── ResourcesPage.tsx
│       │   └── CostsPage.tsx
│       ├── components/
│       │   ├── Sidebar.tsx
│       │   ├── StatCard.tsx
│       │   └── ResourceBadge.tsx
│       └── api/client.ts     # 타입 안전한 API 클라이언트
├── monitoring/
│   ├── prometheus.yml         # 스크랩 설정
│   └── grafana/provisioning/ # 데이터소스 + 대시보드 자동 프로비저닝
├── .github/workflows/ci.yml  # GitHub Actions CI
├── docker-compose.yml
└── .gitignore
```

---

## CI/CD

`main` 브랜치 push 또는 PR 생성 시 자동 실행:

```
1. Backend  — pip install → import 검증 → Docker 빌드
2. Frontend — npm ci → TypeScript 타입 체크 → npm build → Docker 빌드
3. 통합 테스트 — docker compose up → /health 응답 확인 → /metrics 존재 확인
```

---

## 데이터 보존

```bash
docker compose down      # 컨테이너 삭제, 데이터 유지 ✅
docker compose down -v   # 컨테이너 + 데이터 모두 삭제 ⚠️
```

등록한 AWS 계정 정보는 `backend-data` 볼륨에 보존됩니다.
