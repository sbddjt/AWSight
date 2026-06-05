# AWS Monitor

> AWS 콘솔보다 간결하게 — 내 리소스와 비용을 한눈에
> 
---

## 왜 만들었나

AWS 콘솔은 서비스가 너무 많고 복잡해서 **지금 뭐가 켜져 있는지, 얼마가 나왔는지** 파악하기 어렵습니다.  
이 앱은 IAM Access Key 하나만 등록하면 리소스 현황과 비용을 깔끔한 대시보드로 보여줍니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 리소스 대시보드 | EC2, RDS, Lambda, S3 상태를 한 화면에 |
| 비용 추적 | 이달 총액 · 일별 그래프 · 서비스별 파이 차트 |
| 안 끈 리소스 경고 | 30일↑ EC2, 14일↑ RDS를 자동으로 감지해 경고 |
| 멀티 계정 | AWS 계정 여러 개를 등록해서 전환 가능 |
| 앱 모니터링 | Prometheus + Grafana로 API 상태 실시간 확인 |

---

## 기술 스택

```
Frontend   React 18 · TypeScript · Vite · Tailwind CSS · Recharts
Backend    Python 3.12 · FastAPI · boto3 · SQLite
DevOps     Docker Compose · GitHub Actions · Prometheus · Grafana
```

---

## 시작하기

### 요구사항

- Docker Desktop (WSL2 포함)

### 실행

```bash
git clone https://github.com/YOUR_USERNAME/aws-monitor.git
cd aws-monitor
docker compose up -d --build
```

| 서비스 | 주소 |
|--------|------|
| 앱 | http://localhost |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |

Grafana 초기 로그인: `admin` / `admin`

---

## IAM 설정 (AWS 계정 연결 방법)

### 1. IAM 사용자 생성

AWS 콘솔 → IAM → 사용자 → 사용자 생성 → 아래 정책 2개 추가

```
ReadOnlyAccess
AWSBillingReadOnlyAccess
```

### 2. 액세스 키 발급

IAM → 사용자 → 보안 자격 증명 → 액세스 키 만들기  
→ **Access Key ID** 와 **Secret Access Key** 복사

### 3. Cost Explorer 활성화 (1회)

루트 계정으로 → Billing → Cost Explorer → Launch Cost Explorer

### 4. 앱에 등록

앱 실행 후 **계정 관리** 페이지에서 위 키 입력 → 등록

> 키는 등록 즉시 Fernet 암호화되어 로컬 DB에 저장됩니다. 외부로 전송되지 않습니다.

---

## 안 끈 리소스 경고 기준

| 리소스 | 경고 조건 |
|--------|----------|
| EC2 | running 상태로 30일 이상 |
| RDS | available 상태로 14일 이상 |

---

## 로컬 개발 환경

```bash
# 백엔드
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# → http://localhost:8000

# 프론트엔드
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 프로젝트 구조

```
aws-monitor/
├── backend/
│   ├── main.py              # FastAPI 진입점
│   ├── database.py          # SQLite 모델
│   ├── crypto.py            # Fernet 암호화
│   ├── routers/             # accounts / resources / costs
│   └── services/            # AWS API 호출 로직
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard · Accounts · Resources · Costs
│       ├── components/      # 공통 UI 컴포넌트
│       └── api/client.ts    # API 클라이언트
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/provisioning/
├── .github/workflows/ci.yml  # GitHub Actions
└── docker-compose.yml
```

---

## CI/CD

`main` 브랜치 push 또는 PR 생성 시 자동 실행:

1. Python 의존성 설치 + import 검증 + Docker 빌드
2. TypeScript 타입 체크 + React 빌드 + Docker 빌드
3. Docker Compose 통합 테스트 (`/health`, `/metrics` 응답 확인)
