// src/contexts/AuthContext.tsx
import React, { createContext, useEffect, useState, useCallback } from 'react'
import { User, AuthError, Session, AuthResponse } from '@supabase/supabase-js'
import supabase from '@/lib/supabase'
import { setCookie, deleteCookie } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  // Operações básicas
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string, options?: { name?: string; redirectTo?: string; }) => Promise<AuthResponse>
  signOut: () => Promise<{ error?: AuthError }>
  
  // Operações de recuperação de senha
  resetPassword: (email: string, redirectTo?: string) => Promise<{ error?: AuthError }>
  updatePassword: (password: string) => Promise<{ error?: AuthError }>
  
  // Operações de perfil
  updateProfile: (updates: {
    name?: string;
    avatar_url?: string;
    [key: string]: string | undefined;
  }) => Promise<{ error?: AuthError }>
  
  // Operações avançadas
  refreshSession: () => Promise<{ error?: AuthError }>
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>
  
  // Verificações
  isAuthenticated: boolean
  isEmailConfirmed: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para salvar dados de sessão nos cookies
  const saveSessionToCookies = useCallback((session: Session | null) => {
    if (session) {
      setCookie('sb-access-token', session.access_token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
      });
      
      setCookie('sb-refresh-token', session.refresh_token, {
        expires: 30, // Refresh token dura mais tempo
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
      });
      
      setCookie('sb-user', JSON.stringify(session.user), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
      });
    } else {
      // Remove cookies quando logout
      deleteCookie('sb-access-token');
      deleteCookie('sb-refresh-token');
      deleteCookie('sb-user');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Recupera sessão ativa
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error.message)
        } else if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          saveSessionToCookies(session)
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Escuta mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          saveSessionToCookies(session)
          
          // Log específico para diferentes eventos
          switch (event) {
            case 'SIGNED_IN':
              console.log('User signed in:', session?.user?.email)
              break
            case 'SIGNED_OUT':
              console.log('User signed out')
              break
            case 'TOKEN_REFRESHED':
              console.log('Token refreshed')
              break
            case 'USER_UPDATED':
              console.log('User profile updated')
              break
            case 'PASSWORD_RECOVERY':
              console.log('Password recovery initiated')
              break
          }
        }
      }
    )

    return () => {
      mounted = false;
      subscription.unsubscribe()
    }
  }, [saveSessionToCookies])

  // ===== OPERAÇÕES DE AUTENTICAÇÃO =====

  // LOGIN
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true)
      const response = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (response.error) {
        console.error('Sign in error:', response.error.message)
      } else if (response.data.session) {
        saveSessionToCookies(response.data.session)
      }

      return response
    } catch (error) {
      console.error('Unexpected sign in error:', error)
      return { 
        data: { user: null, session: null }, 
        error: error as AuthError 
      }
    } finally {
      setLoading(false)
    }
  }

  // CADASTRO
  const signUp = async (
    email: string, 
    password: string, 
    options?: { name?: string; redirectTo?: string }
  ): Promise<AuthResponse> => {
    try {
      setLoading(true)
      
      const signUpData: {
        email: string;
        password: string;
        options?: {
          data?: {
            full_name?: string;
            name?: string;
          };
          emailRedirectTo?: string;
        };
      } = {
        email: email.trim().toLowerCase(),
        password,
      }

      // Adiciona metadata do usuário se nome fornecido
      if (options?.name) {
        signUpData.options = {
          data: {
            full_name: options.name,
            name: options.name
          }
        }
      }

      // Adiciona URL de redirecionamento se fornecida
      if (options?.redirectTo) {
        signUpData.options = {
          ...signUpData.options,
          emailRedirectTo: options.redirectTo
        }
      }

      const response = await supabase.auth.signUp(signUpData)

      if (response.error) {
        console.error('Sign up error:', response.error.message)
      } else if (response.data.session) {
        saveSessionToCookies(response.data.session)
      }

      return response
    } catch (error) {
      console.error('Unexpected sign up error:', error)
      return { 
        data: { user: null, session: null }, 
        error: error as AuthError 
      }
    } finally {
      setLoading(false)
    }
  }

  // LOGOUT
  const signOut = async (): Promise<{ error?: AuthError }> => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error.message)
        return { error }
      }

      // Limpa estado local e cookies
      setUser(null)
      setSession(null)
      saveSessionToCookies(null)
      
      return {}
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }
  
  // ===== OPERAÇÕES DE RECUPERAÇÃO DE SENHA =====

  // RESET DE SENHA (enviar email)
  const resetPassword = async (
    email: string, 
    redirectTo?: string
  ): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(), 
        {
          redirectTo: redirectTo || `${window.location.origin}/reset-password`,
        }
      )

      if (error) {
        console.error('Reset password error:', error.message)
        return { error }
      }

      return {}
    } catch (error) {
      console.error('Unexpected reset password error:', error)
      return { error: error as AuthError }
    }
  }

  // ATUALIZAR SENHA (quando já logado ou com token de reset)
  const updatePassword = async (password: string): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        console.error('Update password error:', error.message)
        return { error }
      }

      return {}
    } catch (error) {
      console.error('Unexpected update password error:', error)
      return { error: error as AuthError }
    }
  }

  // ===== OPERAÇÕES DE PERFIL =====

  // ATUALIZAR PERFIL
  const updateProfile = async (updates: {
    name?: string;
    avatar_url?: string;
    [key: string]: string | undefined;
  }): Promise<{ error?: AuthError }> => {
    try {
      const updateData: {
        data?: {
          full_name?: string;
          name?: string;
          avatar_url?: string;
          [key: string]: string | undefined;
        };
      } = {}

      // Mapeia os campos
      if (updates.name) {
        updateData.data = {
          ...updateData.data,
          full_name: updates.name,
          name: updates.name
        }
      }

      if (updates.avatar_url) {
        updateData.data = {
          ...updateData.data,
          avatar_url: updates.avatar_url
        }
      }

      // Adiciona outros campos customizados
      Object.keys(updates).forEach(key => {
        if (key !== 'name' && key !== 'avatar_url') {
          updateData.data = {
            ...updateData.data,
            [key]: updates[key]
          }
        }
      })

      const { error } = await supabase.auth.updateUser(updateData)

      if (error) {
        console.error('Update profile error:', error.message)
        return { error }
      }

      return {}
    } catch (error) {
      console.error('Unexpected update profile error:', error)
      return { error: error as AuthError }
    }
  }

  // ===== OPERAÇÕES AVANÇADAS =====

  // REFRESH SESSION
  const refreshSession = async (): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.refreshSession()

      if (error) {
        console.error('Refresh session error:', error.message)
        return { error }
      }

      return {}
    } catch (error) {
      console.error('Unexpected refresh session error:', error)
      return { error: error as AuthError }
    }
  }

  // REENVIAR EMAIL DE CONFIRMAÇÃO
  const resendConfirmation = async (email: string): Promise<{ error?: AuthError }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase()
      })

      if (error) {
        console.error('Resend confirmation error:', error.message)
        return { error }
      }

      return {}
    } catch (error) {
      console.error('Unexpected resend confirmation error:', error)
      return { error: error as AuthError }
    }
  }

  // ===== PROPRIEDADES COMPUTADAS =====
  const isAuthenticated = !!user && !!session
  const isEmailConfirmed = user?.email_confirmed_at != null

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    resendConfirmation,
    isAuthenticated,
    isEmailConfirmed,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}