// src/hooks/useTasks.ts
import { useState, useEffect, useCallback } from 'react';
import { Task, getTasks, createTask, updateTask } from '@/lib/database';
import { toast } from 'sonner';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getTasks();
    
    if (result.success && result.data) {
      setTasks(result.data);
    } else {
      setError(result.error || 'Erro ao buscar tarefas');
      toast.error('Erro', {
        description: result.error || 'Não foi possível carregar a sua Missão Diária.'
      });
    }
    
    setLoading(false);
  }, []);

  const addTask = useCallback(async (taskData: Partial<Omit<Task, 'id' | 'user_id' | 'created_at' | 'completed_at'>>) => {
    const result = await createTask(taskData);
    
    if (result.success && result.data) {
      // Adiciona a nova tarefa e reordena a lista
      setTasks(prev => {
        const newTasks = [result.data!, ...prev];
        return newTasks.sort((a, b) => {
          const priorityOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
      });
      toast.success('Tarefa adicionada com sucesso!');
      return result.data;
    } else {
      toast.error('Erro ao adicionar tarefa', {
        description: result.error || 'Erro inesperado'
      });
      throw new Error(result.error || 'Erro ao adicionar tarefa');
    }
  }, []);

  const completeTask = useCallback(async (taskId: string) => {
    // Remove a tarefa da UI imediatamente para uma resposta rápida (otimismo)
    const originalTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== taskId));

    const result = await updateTask(taskId, { completed_at: new Date().toISOString() });
    
    if (!result.success) {
      toast.error('Falha ao concluir a tarefa', {
        description: result.error || 'A alteração foi desfeita.'
      });
      // Reverte a alteração em caso de erro
      setTasks(originalTasks);
    } else {
      toast.success('Tarefa concluída!');
    }
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, addTask, completeTask, fetchTasks };
};