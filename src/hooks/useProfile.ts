// src/hooks/useProfiles.ts
import { useState, useEffect, useCallback } from 'react';
import { UserProfile, getAllProfiles } from '@/lib/database';
import { toast } from 'sonner';

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await getAllProfiles();
    
    if (result.success && result.data) {
      setProfiles(result.data);
    } else {
      setError(result.error || 'Erro ao buscar perfis de usuário');
      toast.error('Erro', {
        description: result.error || 'Não foi possível carregar a lista de usuários.'
      });
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, loading, error, fetchProfiles };
};