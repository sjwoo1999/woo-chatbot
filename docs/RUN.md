# 실행 가이드

## 준비
1) 의존성 설치
```bash
pnpm i
```

2) 환경 변수 파일 준비
```bash
cp .env.example .env
# API_KEY, MODEL_NAME, SERVER_URL, DB_URL 등을 설정
```

3) 로컬 DB 기동 (선택)
```bash
docker compose up -d
```

4) Drizzle 마이그레이션(추후 스크립트 추가 예정)
```bash
pnpm db:migrate
```

## 개발 모드 실행
```bash
pnpm dev
# web: http://localhost:3000
# server: http://localhost:3001
```

## Git
```bash
git add .
git commit -m "feat: bootstrap woo-chatbot (docs+web+server+db)"
git push origin main
```
