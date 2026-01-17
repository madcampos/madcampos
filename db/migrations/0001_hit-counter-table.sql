-- Migration number: 0001 	 2026-01-16T20:19:37.175Z

CREATE TABLE IF NOT EXISTS hit_counter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT (datetime('now', 'utc')),
  country TEXT NOT NULL,
  user_agent TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_url ON hit_counter(url);
CREATE INDEX IF NOT EXISTS idx_visitor_url ON hit_counter(visitor_id, url);
CREATE INDEX IF NOT EXISTS idx_timestamp ON hit_counter(timestamp DESC);
