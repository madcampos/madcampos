-- Migration number: 0006 	 2026-08-24T23:32:53.184Z

-- Rename hit counter table so it makes more sense.
ALTER TABLE hit_counter RENAME TO visits;

-- Normalize urls.
UPDATE visits
SET url = rtrim(url, '/') || '/';

-- Replaces non normalized spaces.
UPDATE visits
SET url = replace(url, '%20', ' ');

-- Replaces non normalized at signs.
UPDATE visits
SET url = replace(url, '%40', '@');

CREATE TABLE IF NOT EXISTS hit_counter (
	url TEXT PRIMARY KEY,
	total_visitors INTEGER NOT NULL DEFAULT 0,
	unique_visitors INTEGER NOT NULL DEFAULT 0,
	updated_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc'))
);

-- Move existing data to new table.
INSERT INTO hit_counter
	(url, total_visitors, unique_visitors, updated_at)
SELECT
	url,
	COUNT(*) AS total_visitors,
	COUNT(DISTINCT visitor_id) AS unique_visitors,
	(strftime('%Y-%m-%dT%H:%M:%SZ', 'now', 'utc')) AS updated_at
FROM visits
GROUP BY url;
