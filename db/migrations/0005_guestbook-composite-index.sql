-- Migration number: 0005 	 2026-07-17T00:00:00.000Z

CREATE INDEX IF NOT EXISTS idx_guestbook_visitor_timestamp ON guestbook (visitor_id, timestamp DESC);
