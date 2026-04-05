// KI Connect — Supabase Config
// Same project as Kulan LMS — no new project needed

const SUPABASE_URL = 'https://YOUR_PROJECT_URL.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
