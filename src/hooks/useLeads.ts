// src/hooks/useLeads.ts
import { useState, useEffect, useCallback } from 'react';
import { Lead, KanbanStage, getLeads, createLead, updateLead, getKanbanStages, createDefaultKanbanStages } from '@/lib/database';
import { toast } from 'sonner';

export const useLeads = () => {
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Tenta buscar as etapas do Kanban
      const stagesResult = await getKanbanStages();
      let currentStages: KanbanStage[] = [];

      if (stagesResult.success && stagesResult.data) {
        // 2. Se não encontrar etapas, cria as etapas padrão para o usuário
        if (stagesResult.data.length === 0) {
          const defaultStagesResult = await createDefaultKanbanStages();
          if (defaultStagesResult.success && defaultStagesResult.data) {
            currentStages = defaultStagesResult.data;
          } else {
            throw new Error(defaultStagesResult.error || 'Erro ao criar etapas padrão do Kanban.');
          }
        } else {
          currentStages = stagesResult.data;
        }
        setStages(currentStages);
      } else {
        throw new Error(stagesResult.error || 'Erro ao buscar etapas do Kanban.');
      }

      // 3. Busca os leads
      const leadsResult = await getLeads();
      if (leadsResult.success && leadsResult.data) {
        setLeads(leadsResult.data);
      } else {
        throw new Error(leadsResult.error || 'Erro ao buscar leads.');
      }

    } catch (err: any) {
      const errorMessage = err.message || "Ocorreu um erro desconhecido";
      setError(errorMessage);
      toast.error('Erro ao carregar dados', { description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, []);

  const addLead = useCallback(async (leadData: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    // Garante que o novo lead seja adicionado à primeira etapa do funil, ordenada por 'position'
    const firstStage = stages.sort((a, b) => a.position - b.position)[0];
    if (!firstStage) {
        toast.error("Nenhuma etapa inicial encontrada no funil.");
        throw new Error("Nenhuma etapa inicial encontrada no funil.");
    }

    const result = await createLead({ ...leadData, stage_id: firstStage.id });
    
    if (result.success && result.data) {
      setLeads(prev => [result.data!, ...prev]);
      toast.success('Lead cadastrado com sucesso!');
      return result.data;
    } else {
      toast.error('Erro ao cadastrar lead', { description: result.error });
      throw new Error(result.error || 'Erro ao cadastrar lead');
    }
  }, [stages]);

  const updateLeadStage = useCallback(async (leadId: string, newStageId: string) => {
    // Atualização Otimista: atualiza a UI imediatamente para uma experiência fluida
    setLeads(prevLeads =>
      prevLeads.map(lead =>
        lead.id === leadId ? { ...lead, stage_id: newStageId, updated_at: new Date().toISOString() } : lead
      )
    );

    const result = await updateLead(leadId, { stage_id: newStageId });
    
    if (!result.success) {
      toast.error('Falha ao mover o lead', {
        description: result.error || 'A alteração foi desfeita.'
      });
      // Em caso de erro, reverte a alteração buscando os dados mais recentes do backend
      fetchData();
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stages, leads, loading, error, addLead, updateLeadStage };
};