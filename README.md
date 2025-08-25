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
  - [x] `POST /rag/upload`(.md/.txt 우선), `POST /rag/ingest`(본문 직접)
  - [x] 청킹(800±200, overlap 100), OpenAI 임베딩 배치, 청크 upsert
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
- [ ] [P1][@backend] 업로드 파서: `.pdf` 추출기 구현, 대용량 배치/리트라이

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
- 서버 API: `POST /chat/stream` (SSE), `POST /rag/upload`, `POST /rag/ingest`
- 프록시: 웹 `/api/chat/route.ts` → 서버 `/chat/stream`
