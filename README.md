# woo-chatbot

Next.js + NestJS + Postgres(pgvector) 기반 실전형 AI 챗봇 모노레포

## 폴더 구조
```
woo-chatbot/
  apps/
    web/        # Next.js 15 + Tailwind + SSE
    server/     # NestJS + REST + Streaming + Safety
  packages/
    db/         # Drizzle schema & migrations
    shared/     # 공용 타입/ModelProvider 인터페이스
  docs/
  docker-compose.yml
  .env.example
  package.json (pnpm workspace)
```

## 빠른 시작
```bash
pnpm i
# DB 기동
docker compose up -d
# (선택) 컨테이너 내부에서 SQL 마이그레이션 적용
# docker exec -i woo-chatbot-db-1 psql -U postgres -d woo -f - < packages/db/migrations/0001_init.sql
pnpm dev
```

## 문서 바로가기
- PRD: [docs/PRD.md](docs/PRD.md)
- IA: [docs/IA.md](docs/IA.md)
- ERD: [docs/ERD.md](docs/ERD.md)
- SAFETY: [docs/SAFETY.md](docs/SAFETY.md)
- ARCHITECTURE: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 실행 가이드: [docs/RUN.md](docs/RUN.md)

## 진행 현황
- [x] PRD/IA/ERD/SAFETY/ARCHITECTURE 문서 작성
- [x] pnpm 모노레포 구성(`pnpm-workspace.yaml`, 루트 `package.json` 스크립트)
- [x] `packages/shared`: `ModelProvider` 인터페이스, 공용 타입 정의
- [x] `packages/db`: 스키마 확정 및 실제 마이그레이션(0001)
  - [x] `chunks.embedding vector(1536)` 컬럼
  - [x] IVFFlat 인덱스(`vector_cosine_ops`, lists=100)
  - [x] FK/인덱스(messages.conv_id, chunks.doc_id 등)
  - [x] 소프트 삭제(`deleted_at`) 컬럼 추가
- [x] `apps/server`: SSE 스트리밍(`POST /chat/stream`), OpenAI Provider, Safety(Guard/ExceptionFilter)
- [x] RAG 인제스트(최소 동작)
  - [x] `POST /rag/ingest`(본문 직접)
  - [x] 청킹(토큰 기반 overlap), OpenAI 임베딩 배치, 청크 upsert
- [x] 검색 + 프롬프트 합성(최소)
  - [x] `knowledgeBase` 토글 시 상위 청크 6개 검색 → `retrieved_knowledge` 섹션 주입
  - [x] 응답 스트림에 `sources` 도구 이벤트 포함
- [x] 웹 안전/출처 UI(최소)
  - [x] `<RefusalCard />`, `<SafetyNotice />`
  - [x] `<SourceChips />`, `<SourcePanel />`
  - [x] `<CodeBlock />` 하이라이트 + XSS sanitize + 복사 버튼
- [x] 텔레메트리(기본 서비스)
  - [x] `TelemetryService.logEvent()` 추가 (미들웨어 연동은 후속)
- [x] 테스트
  - [x] 단위: Safety 6케이스, RAG 청킹 1케이스
  - [x] 통합: `/chat/stream` placeholder 2케이스
- [x] DevOps: `.env.example`(EMBEDDING_MODEL/DIM/UPLOAD_DIR 추가), `docker-compose.yml`
- [x] 브랜치/PR: `feat/m1-rag-safety-telemetry` 푸시 완료 ([PR 생성 링크](https://github.com/sjwoo1999/woo-chatbot/pull/new/feat/m1-rag-safety-telemetry))

## 남은 태스크 (우선순위/담당)
### 기능/RAG
- [ ] [P1][@backend] 쿼리 확장 규칙(동의어 확장) 고도화/옵션화
- [ ] [P1][@backend] 하이브리드 검색 고도화(MMR, 태그/제목 필터)

### 텔레메트리/보안
- [ ] [P0][@backend] 요청-응답 미들웨어로 latency/차단/툴 사용 로깅
- [ ] [P1][@backend] 토큰 사용량 수집(Provider 메타) 및 `telemetry_events` 저장
- [ ] [P0][@backend] 입력 DTO 검증(Zod/Nest Pipe), 레이트리밋, CORS 강화

### 데이터베이스/마이그레이션
- [ ] [P1][@db] Drizzle migrate 스크립트 정비(`pnpm db:migrate` 실제 적용)
- [ ] [P2][@db] 인덱스/쿼리 플랜 점검 및 파라미터 튜닝(lists/ef_search)

### UI/UX
- [ ] [P1][@web] 출처 미리보기 API 구현 및 `<SourcePanel />` 실데이터 연동
- [ ] [P2][@web] 코드블록 줄 번호 토글/언어 자동 감지 고도화
- [ ] [P2][@web] 거절 템플릿 문구/링크(비상 연락처 등) 보강

### 모델/플러그 가능성
- [ ] [P2][@backend] Provider 스위치: Anthropic/Ollama/vLLM 어댑터 추가/ENV 스위칭

### 테스트/품질
- [ ] [P1][@backend] E2E: 채팅 스트림 정상 + 정치 차단 경로 검증
- [ ] [P2][@backend] 커버리지 80% 목표 달성(현재 핵심 테스트 중심)
- [ ] [P1][@devops] ESLint/Prettier 설정 및 CI 파이프라인 연동

### 배포
- [ ] [P1][@devops] Server: Render/AWS(ECS/Fargate) Docker 이미지/헬스체크
- [ ] [P1][@devops] Web: Vercel 빌드/환경변수 연결
- [ ] [P1][@db] DB: Neon/RDS 가이드 및 마이그레이션 파이프라인
- [ ] [P1][@devops] CI/CD: Lint/Test/Build 워크플로우 구성

## 실행 체크리스트
1) 의존성 설치: `pnpm i`
2) 환경 변수 설정: `.env` → `API_KEY`, `MODEL_NAME`, `SERVER_URL`, `DB_URL`, `EMBEDDING_MODEL`, `EMBEDDING_DIM`, `UPLOAD_DIR`
3) DB 기동: `docker compose up -d`
4) 마이그레이션: `docker exec -i woo-chatbot-db-1 psql -U postgres -d woo -f - < packages/db/migrations/0001_init.sql`
5) 개발 실행: `pnpm dev` (web 3000, server 3001)

## 참고
- Adminer: http://localhost:8080 (DB 확인용)
- 서버 API: `POST /chat/stream` (SSE), `POST /rag/ingest`
- 프록시: 웹 `/api/chat/route.ts` → 서버 `/chat/stream`

## 배포 & 실행 가이드

### 환경 변수
- 공통
  - `API_KEY`: OpenAI API Key (server only 사용)
  - `MODEL_NAME`: 기본 채팅 모델 (예: `gpt-4o-mini`)
  - `DB_URL`: Postgres 연결 문자열 (예: `postgres://user:pass@host:5432/woo`)
  - `EMBEDDING_MODEL`: 임베딩 모델 (예: `text-embedding-3-small`)
  - `EMBEDDING_DIM`: 임베딩 차원 (예: `1536`)
  - `SERVER_URL`: Web → Server 프록시 대상 (예: `http://localhost:3001` 또는 Render URL)

- 웹(Next.js)
  - `NEXT_PUBLIC_SERVER_URL`를 사용하려면 `apps/web/app/api/chat/route.ts`에서 참조하도록 변경 가능. 현재는 `SERVER_URL` 기본값 사용.

### 로컬 개발
```bash
# 설치 및 DB 기동
pnpm i
docker compose up -d
# 마이그레이션 적용
docker exec -i woo-chatbot-db-1 psql -U postgres -d woo -f - < packages/db/migrations/0001_init.sql
# 개발 서버 실행 (web:3000, server:3001)
pnpm dev
```

### 테스트
```bash
# 서버 단위/E2E 테스트 실행
pnpm --filter @woo/server test
```

### 데이터베이스 (Neon 또는 RDS)
- Neon
  - 프로젝트 생성 → Postgres DB 생성 → `DB_URL` 발급 → `.env` 업데이트 → 마이그레이션 적용(위 명령 대신 로컬에서 `psql`로 원격에 실행)
- AWS RDS
  - RDS PostgreSQL 인스턴스 생성 → SG/파이어월 허용 → `DB_URL` 구성 → 마이그레이션 적용

### 서버 배포 (Render 권장)
1) Render Dashboard → New → Web Service → GitHub repo 선택
2) Runtime: Node 20, Build Command: `pnpm i --frozen-lockfile`, Start Command: `node dist/main.js`
3) 서버 빌드 스텝
   - 빌드 전: `pnpm -w i && pnpm --filter @woo/server build`
   - Nest 빌드 산출물 `apps/server/dist`를 실행하도록 설정(Procfile 또는 Start Command 조정 필요)
4) 환경 변수 설정
   - `API_KEY`, `MODEL_NAME`, `DB_URL`, `EMBEDDING_MODEL`, `EMBEDDING_DIM`, `SERVER_URL`
5) 헬스체크
   - 간단한 `GET /rag/chunks/:id` 또는 `GET /` 핑 엔드포인트 추가를 권장(현재는 별도 헬스 엔드포인트 없음)

참고: Render에서 Monorepo인 경우 Root Directory를 `apps/server`로 지정하거나, `Render Build Command`에서 workspace 설치 후 서버 빌드 스크립트를 호출하세요.

### 웹 배포 (Vercel)
1) Import Project → Monorepo에서 `apps/web` 경로 지정
2) Build Command: `pnpm -w i && pnpm --filter @woo/web build`
3) Output: Next.js 기본
4) Env
   - `SERVER_URL`를 서버 배포 주소로 설정 (예: `https://your-render-service.onrender.com`)
5) 도메인 연결 및 배포 확인

### CI/CD (GitHub Actions 개요)
- 워크플로우 예시
```yaml
name: ci
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm' }
      - run: pnpm i --frozen-lockfile
      - run: pnpm --filter @woo/server test
```

### 운영 수칙
- 안전 정책 위반(정치/위험/PII)은 서버 `SafetyGuard`에서 차단/마스킹 처리됨
- 실제 키/민감정보는 절대 레포에 커밋하지 말 것
- 트래픽 증가 시: Postgres 인덱스 파라미터(lists 등) 및 커넥션 풀, Render 인스턴스 스케일링 점검
