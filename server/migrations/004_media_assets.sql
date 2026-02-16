CREATE SCHEMA IF NOT EXISTS cazi;

CREATE TABLE IF NOT EXISTS cazi.media_assets (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  bucket TEXT NULL,
  object_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  content_type TEXT NULL,
  size_bytes BIGINT NULL,
  checksum TEXT NULL,
  owner_user_id TEXT NULL REFERENCES cazi.users(id) ON DELETE SET NULL,
  related_entity_type TEXT NULL,
  related_entity_id TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_media_provider_object_key
  ON cazi.media_assets (provider, object_key);

CREATE INDEX IF NOT EXISTS idx_media_owner_user_id
  ON cazi.media_assets (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_media_related_entity
  ON cazi.media_assets (related_entity_type, related_entity_id);

CREATE INDEX IF NOT EXISTS idx_media_status_created
  ON cazi.media_assets (status, created_at DESC);
