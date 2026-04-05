# KI Connect — Deployment Guide

## Files
- index.html — Login page
- dashboard.html — Student dashboard
- teacher.html — Teacher portal + recording studio
- session.html — Live classroom
- admin.html — Admin panel
- js/supabase.js — Supabase config (update before deploying)
- netlify.toml — Netlify config

---

## Step 1 — Update Supabase credentials

Open every HTML file and find this block near the top:

```js
const SUPABASE_URL = "https://YOUR_PROJECT_URL.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

Replace both values with your real credentials from:
Supabase Dashboard > Project Settings > API

---

## Step 2 — Run SQL migrations in Supabase

Go to Supabase > SQL Editor and run this:

```sql
-- KI Connect tables

create table if not exists kic_sessions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  course text,
  teacher_id uuid references auth.users(id),
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  duration_minutes int default 60,
  status text default 'upcoming',
  max_students int default 50,
  description text,
  created_at timestamptz default now()
);

create table if not exists kic_attendance (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references kic_sessions(id),
  user_id uuid references auth.users(id),
  user_name text,
  joined_at timestamptz default now(),
  left_at timestamptz,
  status text default 'present'
);

create table if not exists kic_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references kic_sessions(id),
  sender_id uuid references auth.users(id),
  sender_name text,
  content text not null,
  role text default 'student',
  created_at timestamptz default now()
);

create table if not exists kic_questions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references kic_sessions(id),
  asker_id uuid references auth.users(id),
  asker_name text,
  question text not null,
  upvotes int default 0,
  answered boolean default false,
  created_at timestamptz default now()
);

-- Enable realtime on all KI Connect tables
alter publication supabase_realtime add table kic_sessions;
alter publication supabase_realtime add table kic_messages;
alter publication supabase_realtime add table kic_attendance;
alter publication supabase_realtime add table kic_questions;

-- Row Level Security
alter table kic_sessions enable row level security;
alter table kic_attendance enable row level security;
alter table kic_messages enable row level security;
alter table kic_questions enable row level security;

-- Policies (allow authenticated users)
create policy "Auth users can read sessions" on kic_sessions for select using (auth.role() = 'authenticated');
create policy "Auth users can insert sessions" on kic_sessions for insert with check (auth.role() = 'authenticated');
create policy "Auth users can update sessions" on kic_sessions for update using (auth.role() = 'authenticated');

create policy "Auth users can read messages" on kic_messages for select using (auth.role() = 'authenticated');
create policy "Auth users can insert messages" on kic_messages for insert with check (auth.role() = 'authenticated');

create policy "Auth users can read attendance" on kic_attendance for select using (auth.role() = 'authenticated');
create policy "Auth users can upsert attendance" on kic_attendance for insert with check (auth.role() = 'authenticated');

create policy "Auth users can read questions" on kic_questions for select using (auth.role() = 'authenticated');
create policy "Auth users can insert questions" on kic_questions for insert with check (auth.role() = 'authenticated');
create policy "Auth users can update questions" on kic_questions for update using (auth.role() = 'authenticated');
```

---

## Step 3 — Deploy to Netlify

### Option A — Drag and drop (fastest)
1. Go to netlify.com and log in
2. Click "Add new site" > "Deploy manually"
3. Drag the entire ki-connect folder into the drop zone
4. Done — Netlify gives you a URL instantly

### Option B — GitHub (recommended for updates)
1. Push the ki-connect folder to a GitHub repo
2. Go to Netlify > "Add new site" > "Import from Git"
3. Connect your GitHub repo
4. Build command: leave empty
5. Publish directory: .
6. Click Deploy

---

## Step 4 — Connect your custom domain

1. In Netlify go to Site Settings > Domain Management
2. Click "Add custom domain"
3. Enter: connect.kulaninstitute.org
4. Go to your DNS provider (Namecheap, GoDaddy, Cloudflare etc.)
5. Add a CNAME record:
   - Name: connect
   - Value: your-site-name.netlify.app
6. Wait 5-30 minutes for DNS to propagate
7. Netlify auto-provisions SSL (HTTPS) for free

---

## Step 5 — Add redirect in your LMS

In any LMS page where you want to link to KI Connect:

```html
<a href="https://connect.kulaninstitute.org?course=security-plus">
  Join Live Session
</a>
```

Or pass a session ID directly:
```html
<a href="https://connect.kulaninstitute.org/session.html?id=SESSION_ID">
  Join Now
</a>
```
