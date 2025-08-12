// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { Task, getPendingTasks, getCompletedTasks, updateTaskStatus, createManualTask } from '@/lib/database'; // Adicionado getCompletedTasks
import { toast } from 'sonner';

export const useTasks = () => {
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]); // Novo estado para tarefas concluídas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Busca as duas listas de tarefas em paralelo para mais performance
    const [pendingResult, completedResult] = await Promise.all([
        getPendingTasks(),
        getCompletedTasks()
    ]);
    
    if (pendingResult.success && pendingResult.data) {
      setPendingTasks(pendingResult.data);
    } else {
      setError(pendingResult.error || 'Erro ao buscar tarefas pendentes');
      toast.error('Erro', {
        description: pendingResult.error || 'Não foi possível carregar as tarefas pendentes.'
      });
    }

    if (completedResult.success && completedResult.data) {
      setCompletedTasks(completedResult.data);
    } else {
        setError(completedResult.error || 'Erro ao buscar histórico de tarefas');
        toast.error('Erro', {
            description: completedResult.error || 'Não foi possível carregar o histórico de tarefas.'
        });
    }
    
    setLoading(false);
  }, []);

  const completeTask = useCallback(async (taskId: string) => {
    const taskToComplete = pendingTasks.find(task => task.id === taskId);
    if (!taskToComplete) return;

    // Atualização otimista: move a tarefa da lista de pendentes para a de concluídas
    setPendingTasks(prev => prev.filter(task => task.id !== taskId));
    setCompletedTasks(prev => [{ ...taskToComplete, status: 'concluida', completed_at: new Date().toISOString() }, ...prev]);

    const result = await updateTaskStatus(taskId, 'concluida');
    
    if (!result.success) {
      toast.error('Erro ao concluir tarefa', {
        description: result.error || 'A alteração foi desfeita.'
      });
      // Em caso de erro, reverte as listas para o estado original buscando os dados novamente
      await fetchTasks();
    } else {
      toast.success('Tarefa concluída!');
    }
  }, [pendingTasks, fetchTasks]);

  const addManualTask = useCallback(async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status' | 'type' | 'completed_at' | 'leads'>) => {
    const result = await createManualTask(taskData);

    if (result.success && result.data) {
        toast.success('Tarefa manual criada com sucesso!');
        // Adiciona a nova tarefa à lista de pendentes para feedback imediato
        setPendingTasks(prevTasks => [result.data!, ...prevTasks]);
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
    tasks: pendingTasks, // Mantém 'tasks' como a lista de pendentes por compatibilidade
    pendingTasks,
    completedTasks,
    loading, 
    error, 
    fetchTasks, 
    completeTask,
    addManualTask
  };
};