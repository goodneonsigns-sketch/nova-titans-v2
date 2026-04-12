import { supabase } from './supabase'

/**
 * Sign up with email and password
 */
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })
  return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

/**
 * Sign in with Google (OAuth)
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  return { data, error }
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get current session/user
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Track a photo download
 */
export async function trackDownload(photoId) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  
  const { data, error } = await supabase
    .from('downloads')
    .insert({ user_id: session.user.id, photo_id: photoId })
  
  return { data, error }
}
