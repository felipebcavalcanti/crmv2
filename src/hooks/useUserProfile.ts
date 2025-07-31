import { useState, useEffect, useCallback } from 'react'
import { UserProfile, getUserProfile, updateUserProfile } from '@/lib/database'
import { toast } from 'sonner'

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Busca o perfil do usuário
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await getUserProfile()
    
    if (result.success && result.data) {
      setProfile(result.data)
    } else {
      setError(result.error || 'Erro ao buscar perfil')
      // Não mostra toast aqui pois pode ser normal não ter perfil ainda
    }
    
    setLoading(false)
  }, [])

  // Atualiza o perfil do usuário
  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>) => {
    const result = await updateUserProfile(updates)
    
    if (result.success && result.data) {
      setProfile(result.data)
      toast.success('Perfil atualizado com sucesso!')
      return result.data
    } else {
      toast.error('Erro ao atualizar perfil', {
        description: result.error || 'Erro inesperado'
      })
      throw new Error(result.error || 'Erro ao atualizar perfil')
    }
  }, [])

  // Carrega perfil na inicialização
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
  }
}