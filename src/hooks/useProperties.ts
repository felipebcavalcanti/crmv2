// src/hooks/useProperties.ts
import { useState, useEffect, useCallback } from 'react';
import { Property, getProperties, createProperty } from '@/lib/database';
import { toast } from 'sonner';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getProperties();
    
    if (result.success && result.data) {
      setProperties(result.data);
    } else {
      setError(result.error || 'Erro ao buscar imóveis');
      toast.error('Erro', {
        description: result.error || 'Não foi possível carregar a lista de imóveis.'
      });
    }
    
    setLoading(false);
  }, []);

  const addProperty = useCallback(async (propertyData: Omit<Property, 'id' | 'user_id' | 'created_at'>) => {
    const result = await createProperty(propertyData);
    
    if (result.success && result.data) {
      setProperties(prev => [result.data!, ...prev]);
      toast.success('Imóvel cadastrado com sucesso!');
      return result.data;
    } else {
      toast.error('Erro ao cadastrar imóvel', {
        description: result.error || 'Erro inesperado'
      });
      throw new Error(result.error || 'Erro ao cadastrar imóvel');
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { properties, loading, error, addProperty, fetchProperties };
};