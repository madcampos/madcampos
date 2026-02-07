-- Migration number: 0002 	 2026-02-07T08:22:12.091Z

CREATE TABLE IF NOT EXISTS guestbook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  timestamp DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')),
  country TEXT NOT NULL,
  user_agent TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guestbook_visitor_id ON guestbook(visitor_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_timestamp ON guestbook(timestamp DESC);
