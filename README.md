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
pnpm db:migrate
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
- [x] `packages/db`: Drizzle 스키마(`users/conversations/messages/documents/chunks/violations/telemetry_events`), 설정 파일
- [x] `apps/server`: NestJS 부트스트랩, SSE 스트리밍 엔드포인트(`POST /chat/stream`), OpenAI Provider(스트리밍), Safety(규칙+Guard+예외 필터), `nest-cli.json`
- [x] `apps/web`: Next.js 채팅 페이지(스트리밍 렌더), 백엔드 프록시(`/app/api/chat/route.ts`), Tailwind 설정 및 글로벌 스타일
- [x] DevOps: `.env.example`, `docker-compose.yml`

## 남은 태스크
### 기능
- [ ] RAG 인제스트 파이프라인: 업로드 → 추출 → 청크 → 임베딩 → pgvector 업서트(백엔드 API/워커)
- [ ] 검색/프롬프트 합성: Top-k/MMR, 시스템 프롬프트에 출처/안전 지침 주입
- [ ] 출처 배지 UI: 문서명/페이지/청크 링크, 우측 패널 하이라이트
- [ ] 코드블록 UX: 언어 감지, 복사 버튼, 줄 번호 토글
- [ ] 거절 템플릿 UI: 정치/위험 차단, 자문 경고, PII 안내 표시
- [ ] 모델 스위치: Anthropic/Ollama/vLLM Provider 추가 및 ENV 스위칭

### 데이터베이스/마이그레이션
- [ ] Drizzle 마이그레이션 생성/적용 스크립트 정비(`db:migrate` 실제 마이그레이션 추가)
- [ ] `chunks.embedding` 벡터 인덱스(GiST/IVFFlat) 생성 마이그레이션
- [ ] FK/인덱스 보강 및 소프트 삭제 전략 검토

### 관측성/보안
- [ ] 텔레메트리/비용/지연 로깅 및 대시보드 연동
- [ ] 입력 검증(DTO/Class-Validator or Zod), 레이트 리밋, 기본 CORS 정책 정교화
- [ ] XSS/코드블록 Sanitization, SSE 연결 안정화(heartbeat, 재시도)

### 테스트/품질
- [ ] 단위 테스트: Safety 규칙/PII 마스킹, Provider 어댑터
- [ ] E2E: 채팅 스트림, 안전 정책 회귀 20케이스 자동화
- [ ] 커버리지 80% 이상, ESLint/Prettier 설정 추가

### 설정/페이지
- [ ] 설정 페이지: 모델/토큰/온도/정책 토글 UI
- [ ] 로그/리포트 페이지: 대화/위반/텔레메트리 조회

### 배포
- [ ] Server: Render/AWS(ECS/Fargate) 도커 이미지/헬스체크
- [ ] Web: Vercel 빌드 설정 및 환경변수 연결
- [ ] DB: Neon/RDS 프로비저닝 가이드, 마이그레이션 파이프라인
- [ ] CI/CD: Lint/Test/Build 워크플로우

## 실행 체크리스트
1) 의존성 설치: `pnpm i`
2) 환경 변수를 `.env`에 설정: `API_KEY`, `MODEL_NAME`, `SERVER_URL`, `DB_URL`
3) DB 기동: `docker compose up -d`
4) 마이그레이션: `pnpm db:migrate`
5) 개발 실행: `pnpm dev` (web 3000, server 3001)

## 참고
- Adminer: http://localhost:8080 (DB 확인용)
- 서버 API: `POST /chat/stream` (SSE)
- 프록시: 웹 `/api/chat/route.ts` → 서버 `/chat/stream`
