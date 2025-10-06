import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUserDetails() {
  const session = await getSession()
  if (!session?.user) return null
  
  return {
    ...session.user,
    id: session.user.id,
    name: session.user.user_metadata?.name,
    email: session.user.email,
  }
}