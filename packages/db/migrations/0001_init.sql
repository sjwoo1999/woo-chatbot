-- enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  title text,
  system_prompt text,
  settings jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON conversations(user_id, created_at);

-- messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id),
  user_id uuid REFERENCES users(id),
  role text NOT NULL,
  content text NOT NULL,
  citations jsonb,
  safety_flags jsonb,
  tool_calls jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_conv_created_at ON messages(conversation_id, created_at);

-- documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id), -- user_id can be null for anonymous uploads
  name text NOT NULL,
  mime_type text,
  size_bytes int,
  status text NOT NULL DEFAULT 'queued',
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- chunks
CREATE TABLE IF NOT EXISTS chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id),
  chunk_index int NOT NULL,
  content text NOT NULL,
  embedding vector(1536), -- EMBEDDING_DIM
  meta jsonb,
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_doc_chunk ON chunks(document_id, chunk_index);
-- vector index (ivfflat cosine)
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- violations
CREATE TABLE IF NOT EXISTS violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  conversation_id uuid REFERENCES conversations(id),
  message_id uuid REFERENCES messages(id),
  category text NOT NULL,
  rule_key text,
  action text NOT NULL,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- telemetry_events
CREATE TABLE IF NOT EXISTS telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  conversation_id uuid REFERENCES conversations(id),
  message_id uuid REFERENCES messages(id),
  event_name text NOT NULL,
  properties jsonb,
  cost_tokens_prompt int,
  cost_tokens_completion int,
  latency_ms int,
  created_at timestamptz NOT NULL DEFAULT now()
);
