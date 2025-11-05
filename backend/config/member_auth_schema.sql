-- Migration script to add member authentication fields
-- Run this script to update existing members table

-- Add password_hash column to members table
ALTER TABLE members ADD password_hash VARCHAR2(255);

-- Add password_changed column (to track if member has changed initial password)
ALTER TABLE members ADD password_changed NUMBER(1) DEFAULT 0 CHECK (password_changed IN (0, 1));

-- Add index on email for faster lookups (if not already exists)
-- CREATE INDEX idx_members_email ON members(email); -- Already exists in schema.sql

COMMIT;

