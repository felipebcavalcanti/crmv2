import React, { createContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isConfigured: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      console.warn('Supabase not configured. Authentication disabled.')
      setLoading(false)
      return
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      }
      setUser(session?.user ?? null)
      setLoading(false)
    }).catch((error) => {
      console.error('Error in getSession:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [configured])

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      // Simulação de login quando Supabase não está configurado
      console.log('Simulating login with:', email)
      setUser({ email, id: 'demo-user' } as User)
      return {}
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return {}
    } catch (error) {
      return { error: error.message }
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!configured) {
      // Simulação de cadastro quando Supabase não está configurado
      console.log('Simulating signup with:', email)
      setUser({ email, id: 'demo-user' } as User)
      return {}
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      return {}
    } catch (error) {
      return { error: error.message }
    }
  }

  const signOut = async () => {
    if (!configured) {
      setUser(null)
      return
    }

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isConfigured: configured,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}