/* ─────────────────────────────────────────────────────────
   KI Connect — Core Config
   Single source of truth. Every page loads this after the CDN.
───────────────────────────────────────────────────────── */

const SUPABASE_URL = 'https://dmnrtvkauymnzytqkmvc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtbnJ0dmthdXltbnp5dHFrbXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MDg0OTksImV4cCI6MjA5MDM4NDQ5OX0.mEFYJYjvsr2pEgCm5pSMZ2xCYVO8XRS8oiRCkNu-fUM';

// One client, used everywhere
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ── Auth ─────────────────────────────────────────────── */

async function getUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

// Call at top of every protected page.
// Returns { user, profile } or redirects to login.
async function requireAuth() {
  try {
    const user = await getUser();
    if (!user) { window.location.replace('index.html'); return null; }
    const profile = await getProfile(user.id);
    if (!profile) { window.location.replace('index.html'); return null; }
    return { user, profile };
  } catch (err) {
    console.error('requireAuth failed:', err);
    window.location.replace('index.html');
    return null;
  }
}

// Enforce role. Pass one or more allowed roles.
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
  await db.auth.signOut();
  window.location.replace('index.html');
}

/* ── UI Helpers ───────────────────────────────────────── */

function toast(msg, type = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.className = 'toast toast--' + type + ' toast--show';
  el.querySelector('.toast__msg').textContent = msg;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('toast--show'), 3500);
}

// btn = element or id string
function btnLoad(btn, loading) {
  const el = typeof btn === 'string' ? document.getElementById(btn) : btn;
  if (!el) return;
  el.disabled = loading;
  el.setAttribute('data-loading', loading ? '1' : '');
}

function fieldError(inputEl, msg) {
  const wrap = inputEl.closest('.field') || inputEl.parentElement;
  let err = wrap.querySelector('.field__err');
  if (!err) {
    err = document.createElement('span');
    err.className = 'field__err';
    wrap.appendChild(err);
  }
  err.textContent = msg;
  inputEl.classList.toggle('field__input--err', !!msg);
}

function clearErrors(form) {
  form.querySelectorAll('.field__err').forEach(e => e.textContent = '');
  form.querySelectorAll('.field__input--err').forEach(e => e.classList.remove('field__input--err'));
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

function ago(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return fmtDate(d);
}
