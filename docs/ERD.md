# ERD: woo-chatbot

## 1) Mermaid ER 다이어그램
```mermaid
erDiagram
  users ||--o{ conversations : has
  conversations ||--o{ messages : has
  users ||--o{ documents : uploads
  documents ||--o{ chunks : contains
  users ||--o{ violations : triggers
  users ||--o{ telemetry_events : emits
  conversations ||--o{ telemetry_events : context
  messages ||--o{ telemetry_events : context
  documents ||--o{ telemetry_events : context

  users {
    uuid id PK
    text email UK
    text display_name
    text role  "admin|user"
    timestamptz created_at
  }

  conversations {
    uuid id PK
    uuid user_id FK
    text title
    text system_prompt
    jsonb settings
    timestamptz created_at
    timestamptz archived_at
    index idx_user_created_at(user_id, created_at)
  }

  messages {
    uuid id PK
    uuid conversation_id FK
    uuid user_id FK
    text role "user|assistant|system"
    text content
    jsonb citations  "[{docId, chunkId, score}]"
    jsonb safety_flags "{politics, risk, pii}"
    jsonb tool_calls
    timestamptz created_at
    index idx_conv_created_at(conversation_id, created_at)
  }

  documents {
    uuid id PK
    uuid user_id FK
    text name
    text mime_type
    int size_bytes
    text status "queued|chunking|embedding|ready|error"
    jsonb meta
    timestamptz created_at
  }

  chunks {
    uuid id PK
    uuid document_id FK
    int chunk_index
    text content
    vector embedding
    jsonb meta
    gist idx_embedding(embedding)
    index idx_doc_chunk(document_id, chunk_index)
  }

  violations {
    uuid id PK
    uuid user_id FK
    uuid conversation_id FK
    uuid message_id FK
    text category "politics|risk|advice|pii"
    text rule_key
    text action "block|mask|warn"
    jsonb detail
    timestamptz created_at
  }

  telemetry_events {
    uuid id PK
    uuid user_id FK
    uuid conversation_id FK
    uuid message_id FK
    text event_name
    jsonb properties
    numeric cost_tokens_prompt
    numeric cost_tokens_completion
    numeric latency_ms
    timestamptz created_at
  }
```

## 2) 컬럼 정의 요약
- users: 이메일(고유), 표시명, 역할, 생성일.
- conversations: 사용자 참조, 제목, 시스템 프롬프트, 설정 JSON, 생성/보관.
- messages: 대화/사용자 참조, 역할, 본문, 출처/안전/도구, 생성일, 정렬 인덱스.
- documents: 업로더, 파일 메타, 처리 상태, 생성일.
- chunks: 문서 참조, 청크 인덱스, 내용, 임베딩(vector), 메타, 벡터 인덱스.
- violations: 위반 카테고리/규칙/액션/세부/타임스탬프.
- telemetry_events: 비용/지연/이벤트명/속성.

## 3) 샘플 데이터
```sql
-- users
INSERT INTO users(id, email, display_name, role, created_at)
VALUES ('00000000-0000-0000-0000-000000000001','pm@acme.com','PM','admin', now());

-- conversations
INSERT INTO conversations(id, user_id, title, system_prompt, settings, created_at)
VALUES ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','온보딩','You are helpful', '{"topK":8}', now());

-- messages
INSERT INTO messages(id, conversation_id, user_id, role, content, citations, safety_flags, created_at)
VALUES ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','user','회사 정책 알려줘', '[]', '{"pii":false}', now());

-- documents
INSERT INTO documents(id, user_id, name, mime_type, size_bytes, status, meta, created_at)
VALUES ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','policy.pdf','application/pdf', 102400, 'ready','{}', now());

-- chunks
INSERT INTO chunks(id, document_id, chunk_index, content, embedding, meta)
VALUES ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001', 0, '휴가 정책 ...', '[0.01, 0.02, ...]', '{}');

-- violations
INSERT INTO violations(id, user_id, conversation_id, message_id, category, rule_key, action, detail, created_at)
VALUES ('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','pii','ssn_regex','mask','{"matched":"123-45-6789"}', now());

-- telemetry_events
INSERT INTO telemetry_events(id, user_id, conversation_id, message_id, event_name, properties, cost_tokens_prompt, cost_tokens_completion, latency_ms, created_at)
VALUES ('60000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','completion','{}', 120, 380, 950, now());
```
