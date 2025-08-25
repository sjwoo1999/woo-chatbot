import { pgTable, uuid, text, integer, jsonb, timestamp, vector, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  emailUk: uniqueIndex('uk_users_email').on(t.email),
}));

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title'),
  systemPrompt: text('system_prompt'),
  settings: jsonb('settings'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
}, (t) => ({
  userCreatedIdx: index('idx_user_created_at').on(t.userId, t.createdAt),
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull(),
  userId: uuid('user_id'),
  role: text('role').notNull(),
  content: text('content').notNull(),
  citations: jsonb('citations'),
  safetyFlags: jsonb('safety_flags'),
  toolCalls: jsonb('tool_calls'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  convCreatedIdx: index('idx_conv_created_at').on(t.conversationId, t.createdAt),
}));

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  status: text('status').notNull().default('queued'),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const chunks = pgTable('chunks', {
  id: uuid('id').primaryKey().defaultRandom(),
  documentId: uuid('document_id').notNull(),
  chunkIndex: integer('chunk_index').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  meta: jsonb('meta'),
}, (t) => ({
  docChunkIdx: index('idx_doc_chunk').on(t.documentId, t.chunkIndex),
  // GIST 인덱스는 마이그레이션에서 생성
}));

export const violations = pgTable('violations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  conversationId: uuid('conversation_id'),
  messageId: uuid('message_id'),
  category: text('category').notNull(),
  ruleKey: text('rule_key'),
  action: text('action').notNull(),
  detail: jsonb('detail'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const telemetryEvents = pgTable('telemetry_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  conversationId: uuid('conversation_id'),
  messageId: uuid('message_id'),
  eventName: text('event_name').notNull(),
  properties: jsonb('properties'),
  costTokensPrompt: integer('cost_tokens_prompt'),
  costTokensCompletion: integer('cost_tokens_completion'),
  latencyMs: integer('latency_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
