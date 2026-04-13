-- ============================================================
-- Vector Search Setup
-- Enables pgvector and adds embedding columns to searchable tables
-- ============================================================

-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- ADD EMBEDDING COLUMNS
-- Embeddings allow semantic / vector similarity search
-- across contracts, employees, and activity logs.
-- Dimension: 1536 (OpenAI text-embedding-3-small compatible)
-- ============================================================

-- Contract embeddings
-- Encodes: employee name + role + contract type + terms + status
ALTER TABLE contract
  ADD COLUMN contract_embedding vector(1536);

-- Employee embeddings
-- Encodes: name + role (useful for semantic employee search)
ALTER TABLE employee
  ADD COLUMN employee_embedding vector(1536);

-- Notification template embeddings
-- Encodes: subject + body (useful for finding similar templates)
ALTER TABLE notification_template
  ADD COLUMN template_embedding vector(1536);

-- ============================================================
-- VECTOR INDEXES (HNSW for fast approximate nearest neighbor)
-- ============================================================

CREATE INDEX idx_contract_embedding
  ON contract
  USING hnsw (contract_embedding vector_cosine_ops);

CREATE INDEX idx_employee_embedding
  ON employee
  USING hnsw (employee_embedding vector_cosine_ops);

CREATE INDEX idx_template_embedding
  ON notification_template
  USING hnsw (template_embedding vector_cosine_ops);
