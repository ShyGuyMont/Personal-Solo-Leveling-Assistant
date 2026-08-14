export const youtubeOauthStatesSchema = `
CREATE TABLE IF NOT EXISTS youtube_oauth_states (
  state_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
)`;

export const youtubeConnectionsSchema = `
CREATE TABLE IF NOT EXISTS youtube_connections (
  user_id TEXT PRIMARY KEY NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  granted_scopes TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  connected_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_sync_at TEXT
)`;

export const aiTransmissionsSchema = `
CREATE TABLE IF NOT EXISTS ai_transmissions (
  request_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  response_status INTEGER,
  result_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
)`;
