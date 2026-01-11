-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_name TEXT DEFAULT 'Desi Educators',
    support_email TEXT DEFAULT 'desieducators@outlook.com',
    support_phone TEXT DEFAULT '+917982626546',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Insert default settings if not exists
INSERT INTO platform_settings (
        site_name,
        support_email,
        support_phone,
        maintenance_mode
    )
SELECT 'Desi Educators',
    'desieducators@outlook.com',
    '+917982626546',
    FALSE
WHERE NOT EXISTS (
        SELECT 1
        FROM platform_settings
    );
-- Enable RLS for platform_settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
-- Allow public read access to settings (for site name, maintenance check)
CREATE POLICY "Public read access to settings" ON platform_settings FOR
SELECT USING (true);
-- Allow admins to update settings
CREATE POLICY "Admins can update settings" ON platform_settings FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
    );
-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    name TEXT,
    -- cache name for easier display
    email TEXT,
    -- cache email
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Pending', 'Resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Enable RLS for support_tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
-- Allow users to view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets FOR
SELECT USING (auth.uid() = user_id);
-- Allow users to create tickets
CREATE POLICY "Users can create tickets" ON support_tickets FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Allow admins to view all tickets
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
    );
-- Allow admins to update tickets (e.g. status)
CREATE POLICY "Admins can update tickets" ON support_tickets FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE profiles.id = auth.uid()
                AND profiles.role = 'admin'
        )
    );
-- Add some seed data for tickets if empty
-- Using valid SQL syntax: SELECT ... FROM ... WHERE ... LIMIT
INSERT INTO support_tickets (user_id, name, email, subject, message, status)
SELECT id,
    'System Test',
    'desieducators@outlook.com',
    'Sample Ticket',
    'This is a seeded ticket to test the admin panel.',
    'Open'
FROM auth.users
WHERE NOT EXISTS (
        SELECT 1
        FROM support_tickets
    )
LIMIT 1;