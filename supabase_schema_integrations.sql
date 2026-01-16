
-- Create a table to store OAuth tokens for user integrations
create table public.connected_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id text not null, -- Stores the Clerk User ID
  provider text not null, -- 'google', 'slack', 'notion'
  access_token text not null,
  refresh_token text,
  expires_at bigint, -- Timestamp (ms) when token expires
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Ensure one account per provider per user (simplify for now)
  unique(user_id, provider)
);

-- Enable RLS
alter table public.connected_accounts enable row level security;

-- Policy: Users can only see/edit their own accounts
create policy "Users can manage their own integrations"
  on public.connected_accounts
  for all
  using (user_id = auth.uid()::text) -- Note: If using Clerk, we might match the string ID passed from client
  with check (user_id = auth.uid()::text); 
  -- CAUTION: Since we use Clerk and Supabase simply as a data store via anon key in some places, 
  -- ensure your application logic enforces user_id matching if RLS relies on Supabase Auth.
  -- If you just pass user_id from client, RLS won't work perfectly without custom claims.
  -- For this MVP, we will rely on server-side logic to query by user_id.

