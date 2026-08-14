CREATE TABLE IF NOT EXISTS ai_transmissions (
  request_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  response_status INTEGER,
  result_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_transmissions_user_request
ON ai_transmissions(user_id, request_id);

CREATE INDEX IF NOT EXISTS idx_ai_transmissions_expires_at
ON ai_transmissions(expires_at);

PRAGMA optimize;
