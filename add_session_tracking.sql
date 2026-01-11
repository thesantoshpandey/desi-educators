-- Add session tracking columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_session_id UUID,
    ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();
-- Security Note:
-- We will use `crypto.randomUUID()` in the client/server to generate a session ID on login.
-- This ID will be stored here. Middleware will check if the user's cookie session ID matches this.
-- If not, it means a newer login happened elsewhere.