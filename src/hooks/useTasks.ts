// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { Task, getPendingTasks, updateTaskStatus, createManualTask } from '@/lib/database'; // Adicionado createManualTask
import { toast } from 'sonner';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getPendingTasks();
    
    if (result.success && result.data) {
      setTasks(result.data);
    } else {
      setError(result.error || 'Erro ao buscar tarefas');
      toast.error('Erro', {
        description: result.error || 'Não foi possível carregar a lista de tarefas.'
      });
    }
    
    setLoading(false);
  }, []);

  const completeTask = useCallback(async (taskId: string) => {
    const originalTasks = [...tasks];
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

    const result = await updateTaskStatus(taskId, 'concluida');
    
    if (!result.success) {
      toast.error('Erro ao concluir tarefa', {
        description: result.error || 'A tarefa foi restaurada.'
      });
      setTasks(originalTasks);
    } else {
      toast.success('Tarefa concluída!');
    }
  }, [tasks]);

  // NOVA FUNÇÃO: Adiciona uma tarefa manual
  const addManualTask = useCallback(async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status' | 'type' | 'completed_at' | 'leads'>) => {
    const result = await createManualTask(taskData);

    if (result.success && result.data) {
        toast.success('Tarefa manual criada com sucesso!');
        // Adiciona a nova tarefa no topo da lista para feedback imediato
        setTasks(prevTasks => [result.data!, ...prevTasks]);
        return true;
    } else {
        toast.error('Erro ao criar tarefa', {
            description: result.error || 'Não foi possível salvar a tarefa manual.'
        });
        return false;
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { 
    tasks, 
    loading, 
    error, 
    fetchTasks, 
    completeTask,
    addManualTask // Exporta a nova função
  };
};