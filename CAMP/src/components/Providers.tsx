'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const SessionContext = createContext<{
  session: Session | null
  isLoading: boolean
}>({
  session: null,
  isLoading: true,
})

export function useSession() {
  return useContext(SessionContext)
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session)
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session)
        setIsLoading(false)

        if (event === 'SIGNED_IN') {
          // Force a router refresh to update the UI
          router.refresh()
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SessionContext.Provider>
  )
} 