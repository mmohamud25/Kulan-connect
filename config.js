/* ─────────────────────────────────────────────────────────
   KI Connect — Shared config + helpers
   Loaded by dashboard.html, teacher.html, session.html, admin.html
───────────────────────────────────────────────────────── */

const SUPABASE_URL = 'https://dmnrtvkauymnzytqkmvc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbnJ0dmthdXltbnp5dHFrbXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDg0OTksImV4cCI6MjA5MDM4NDQ5OX0.mEFYJYjvsr2pEgCm5pSMZ2xCYVO8XRS8oiRCkNu-fUM';

// Single Supabase client shared across all pages
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── Auth ─────────────────────────────────────────────── */

async function getUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function getProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) { console.warn('getProfile:', error.message); return null; }
    return data;
  } catch (e) {
    console.error('getProfile exception:', e);
    return null;
  }
}

// Call at the top of every protected page.
// Returns { user, profile } or redirects to login.
async function requireAuth() {
  try {
    const user = await getUser();
    if (!user) { window.location.replace('index.html'); return null; }
    const profile = await getProfile(user.id);
    if (!profile) { window.location.replace('index.html'); return null; }
    return { user, profile };
  } catch (err) {
    console.error('requireAuth:', err);
    window.location.replace('index.html');
    return null;
  }
}

// Like requireAuth but also enforces role.
async function requireRole(...roles) {
  const session = await requireAuth();
  if (!session) return null;
  if (!roles.includes(session.profile.role)) {
    goHome(session.profile.role);
    return null;
  }
  return session;
}

function goHome(role) {
  const map = { admin: 'admin.html', teacher: 'teacher.html', student: 'dashboard.html' };
  window.location.replace(map[role] || 'index.html');
}

async function logout() {
  try { await db.auth.signOut(); } catch (_) {}
  window.location.replace('index.html');
}

/* ── UI Helpers ───────────────────────────────────────── */

function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'toast toast--' + type + ' toast--show';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('toast--show'), 3400);
}

function btnLoad(el, loading) {
  const btn = typeof el === 'string' ? document.getElementById(el) : el;
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('loading', loading);
}

/* ── Formatting ───────────────────────────────────────── */

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function ago(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return fmtDate(d);
}
