-- Migration number: 0003 	 2026-02-10T03:47:32.692Z

ALTER TABLE guestbook
ADD COLUMN ip_address TEXT NOT NULL;
