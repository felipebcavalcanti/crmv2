// src/hooks/useProperties.ts
import { useState, useEffect, useCallback } from 'react';
import { Property, getProperties, createProperty, getPropertyById, searchProperties } from '@/lib/database';
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

  const addProperty = useCallback(async (propertyData: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const result = await createProperty(propertyData);
    
    if (result.success && result.data) {
      // Adiciona o novo imóvel à lista existente para reatividade instantânea
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

  // NOVA FUNÇÃO: Busca um único imóvel por seu ID
  const fetchPropertyById = useCallback(async (propertyId: string) => {
    setLoading(true);
    const result = await getPropertyById(propertyId);
    setLoading(false);

    if (result.success && result.data) {
        return result.data;
    } else {
        toast.error('Erro ao buscar imóvel', {
            description: result.error || 'Imóvel não encontrado.'
        });
        return null;
    }
  }, []);

  // NOVA FUNÇÃO: Executa uma busca por imóveis
  const searchForProperties = useCallback(async (searchTerm: string) => {
    setLoading(true);
    const result = await searchProperties(searchTerm);
    setLoading(false);

    if (result.success && result.data) {
        return result.data;
    } else {
        toast.error('Erro na busca', {
            description: result.error || 'Não foi possível realizar a busca.'
        });
        return [];
    }
  }, []);


  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return { 
    properties, 
    loading, 
    error, 
    addProperty, 
    fetchProperties,
    fetchPropertyById,    // Exporta a nova função
    searchForProperties   // Exporta a nova função
  };
};