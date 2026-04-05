// ── KI Connect — Shared Config ──────────────────────────
// Replace these with your real values from:
// Supabase Dashboard > Project Settings > API

const SUPABASE_URL  = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON = 'YOUR_ANON_KEY';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth helpers ─────────────────────────────────────────

async function getUser() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}

async function getProfile(userId) {
  const { data } = await db.from('profiles').select('*').eq('id', userId).single();
  return data;
}

async function requireAuth() {
  const user = await getUser();
  if (!user) { window.location.href = 'index.html'; return null; }
  const profile = await getProfile(user.id);
  return { user, profile };
}

async function requireRole(...roles) {
  const auth = await requireAuth();
  if (!auth) return null;
  if (!roles.includes(auth.profile?.role)) { redirectByRole(auth.profile?.role); return null; }
  return auth;
}

function redirectByRole(role) {
  if (role === 'admin')   return window.location.href = 'admin.html';
  if (role === 'teacher') return window.location.href = 'teacher.html';
  window.location.href = 'dashboard.html';
}

async function signOutUser() {
  await db.auth.signOut();
  window.location.href = 'index.html';
}

// ── UI helpers ───────────────────────────────────────────

function showToast(icon, msg, duration = 3200) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

function nowTime() {
  return new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
