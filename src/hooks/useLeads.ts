// src/hooks/useLeads.ts
import { useState, useEffect, useCallback } from 'react';
import { 
    Lead, 
    KanbanStage, 
    LeadEvent,
    getLeads, 
    createLead, 
    updateLead, 
    getKanbanStages, 
    createDefaultKanbanStages, 
    createLeadEvent, 
    getInactiveLeads, 
    searchLeads,
    getLeadEvents
} from '@/lib/database';
import { toast } from 'sonner';
import supabase from '@/lib/supabase';

export const useLeads = () => {
    const [stages, setStages] = useState<KanbanStage[]>([]);
    const [activeLeads, setActiveLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const stagesResult = await getKanbanStages();
            if (stagesResult.success && stagesResult.data) {
                if (stagesResult.data.length === 0) {
                    const defaultStagesResult = await createDefaultKanbanStages();
                    setStages(defaultStagesResult.data || []);
                } else {
                    setStages(stagesResult.data);
                }
            } else {
                throw new Error(stagesResult.error || 'Erro ao buscar etapas do Kanban.');
            }

            const leadsResult = await getLeads();
            if (leadsResult.success && leadsResult.data) {
                setActiveLeads(leadsResult.data);
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
        const firstStage = stages.sort((a, b) => a.position - b.position)[0];
        if (!firstStage) {
            toast.error("Nenhuma etapa inicial encontrada no funil.");
            throw new Error("Nenhuma etapa inicial encontrada no funil.");
        }

        const result = await createLead({ ...leadData, stage_id: firstStage.id });
        
        if (result.success && result.data) {
            await createLeadEvent({ lead_id: result.data.id, event_type: 'Criação', details: { initialData: leadData } });
            await fetchData();
            toast.success('Lead cadastrado com sucesso!');
            return result.data;
        } else {
            toast.error('Erro ao cadastrar lead', { description: result.error });
            throw new Error(result.error || 'Erro ao cadastrar lead');
        }
    }, [stages, fetchData]);

    const updateLeadStage = useCallback(async (leadId: string, newStageId: string) => {
        // Atualização otimista - atualiza o estado local imediatamente
        setActiveLeads(prevLeads => 
            prevLeads.map(lead => 
                lead.id === leadId 
                    ? { ...lead, stage_id: newStageId, updated_at: new Date().toISOString() }
                    : lead
            )
        );

        try {
            const result = await updateLead(leadId, { stage_id: newStageId });
            
            if (result.success) {
                const stageName = stages.find(s => s.id === newStageId)?.name || 'etapa desconhecida';
                await createLeadEvent({ lead_id: leadId, event_type: 'Movimentação', details: { to: stageName } });
            } else {
                // Se falhou, reverte a mudança otimista
                toast.error('Falha ao mover o lead', { description: result.error || 'A alteração foi desfeita.' });
                // Recarrega os dados para sincronizar com o servidor
                const leadsResult = await getLeads();
                if (leadsResult.success && leadsResult.data) {
                    setActiveLeads(leadsResult.data);
                }
            }
        } catch {
            // Se deu erro, reverte a mudança otimista
            toast.error('Erro ao mover o lead');
            const leadsResult = await getLeads();
            if (leadsResult.success && leadsResult.data) {
                setActiveLeads(leadsResult.data);
            }
        }
    }, [stages]);

    const updateLeadOutcome = useCallback(async (leadId: string, outcome: 'Ganho' | 'Perdido' | 'Ativo', details: object = {}) => {
        let errorOccurred = false;

        if (outcome === 'Ativo') {
            const { error } = await supabase.rpc('reactivate_lead', { p_lead_id: leadId });
            if (error) {
                errorOccurred = true;
                toast.error("Erro ao reativar lead", { description: error.message });
            }
        } else {
            const { success, error } = await updateLead(leadId, { outcome, status: 'Finalizado' });
            if (!success) {
                errorOccurred = true;
                toast.error('Falha ao atualizar o status do lead', { description: error });
            }
        }

        if (!errorOccurred) {
            const event_type = outcome === 'Ativo' ? 'Reativação' : outcome;
            await createLeadEvent({ lead_id: leadId, event_type, details });
            toast.success(`Lead atualizado para "${outcome}" com sucesso!`);
            
            // CORREÇÃO: Garante que os dados sejam recarregados em TODOS os casos de sucesso.
            await fetchData();
        }
    }, [fetchData]);

    const fetchLeadEvents = useCallback(async (leadId: string): Promise<LeadEvent[]> => {
        const result = await getLeadEvents(leadId);
        if (result.success && result.data) {
            return result.data;
        }
        toast.error("Erro ao buscar histórico do lead", { description: result.error });
        return [];
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { 
        stages, 
        leads: activeLeads,
        loading, 
        error, 
        addLead, 
        updateLeadStage, 
        updateLeadOutcome, 
        getInactiveLeads,
        searchLeads,
        fetchLeadEvents
    };
};