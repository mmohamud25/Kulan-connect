// KI Connect — Auth Helpers

async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  return user;
}

async function signOut() {
  await supabaseClient.auth.signOut();
  window.location.href = 'index.html';
}

async function requireAuth(role = null) {
  const user = await getUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }

  if (role) {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== role) {
      window.location.href = 'dashboard.html';
      return null;
    }
  }

  return user;
}

async function getUserProfile(userId) {
  const { data } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}
