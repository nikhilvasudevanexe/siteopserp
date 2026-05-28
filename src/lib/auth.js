import { supabase } from './supabase.js';

// Magic-link sign in. Supabase emails a link; clicking it returns the user
// to the app with a session.
export async function signInWithMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// The application user row (organisation_id, role, display_name) that pairs
// with the auth user. Null if the auth user has no public.users row yet.
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from('users')
    .select('id, organisation_id, email, display_name, role')
    .eq('id', session.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}
