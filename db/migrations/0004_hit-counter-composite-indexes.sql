-- Migration number: 0004 	 2026-07-17T14:30:35.022Z

CREATE INDEX IF NOT EXISTS idx_hit_counter_url_timestamp ON hit_counter (url, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_hit_counter_url_visitor_timestamp ON hit_counter (url, visitor_id, timestamp DESC);
