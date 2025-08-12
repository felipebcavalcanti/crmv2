// src/pages/Index.tsx
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Check, Loader2, Zap, AlertTriangle, ListTodo, Building, Users, FolderKanban, Plus, History } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/lib/database";
import { useProperties } from "@/hooks/useProperties";
import { useLeads } from "@/hooks/useLeads";
import { useProjects } from "@/hooks/useProjects";
import { AddManualTaskModal } from "@/components/AddManualTaskModal";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

// Componente para um item de tarefa PENDENTE
const TaskItem = ({ task, onComplete }: { task: Task & { leads?: { name: string } | null }; onComplete: (taskId: string) => void }) => {
    const priorityConfig = {
        alta: { icon: Zap, color: "text-red-500", ring: "ring-red-200" },
        media: { icon: AlertTriangle, color: "text-orange-500", ring: "ring-orange-200" },
        baixa: { icon: ListTodo, color: "text-blue-500", ring: "ring-blue-200" },
    };
    const config = priorityConfig[task.priority] || priorityConfig.baixa;
    const Icon = config.icon;
    const leadName = task.leads?.name;

    return (
        <div className="flex items-center p-3 transition-colors hover:bg-gray-50/50 rounded-lg">
            <div className={`mr-4 flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${config.ring} ring-2`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{task.title}</p>
                {leadName && <p className="text-sm text-gray-500">Lead: {leadName}</p>}
            </div>
            <Button size="sm" variant="outline" onClick={() => onComplete(task.id)} className="ml-4">
                <Check className="w-4 h-4" />
            </Button>
        </div>
    );
};

// Componente para um item de tarefa CONCLUÍDA
const CompletedTaskItem = ({ task }: { task: Task & { leads?: { name: string } | null }}) => {
    const leadName = task.leads?.name;
    return (
        <div className="flex items-center p-3">
            <div className="mr-4 flex-shrink-0">
                <Check className="w-5 h-5 text-green-500" />
            </div>
            <div className="flex-grow">
                <p className="text-gray-500 line-through">{task.title}</p>
                {leadName && <p className="text-sm text-gray-400">Lead: {leadName}</p>}
            </div>
            <div className="ml-4 text-sm text-gray-400">
                {task.completed_at ? format(parseISO(task.completed_at), 'dd/MM/yyyy', { locale: ptBR }) : ''}
            </div>
        </div>
    );
};

const Index = () => {
  const { pendingTasks, completedTasks, loading: loadingTasks, addManualTask, completeTask } = useTasks();
  const { properties } = useProperties();
  const { leads } = useLeads();
  const { projects } = useProjects();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const loading = loadingTasks || !properties || !leads || !projects;

  const priorityTasks = useMemo(() => ({
      p1: pendingTasks.filter(t => t.type === 'NOVO_LEAD' || t.priority === 'alta'),
      p2: pendingTasks.filter(t => t.type === 'REGRA_MOTOR' && t.priority === 'media'),
      p3: pendingTasks.filter(t => t.type === 'MANUAL' || t.priority === 'baixa'),
  }), [pendingTasks]);

  const stats = {
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'Disponível').length,
    totalLeads: leads.length,
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600 mt-1">Sua Missão Diária e visão geral do negócio.</p>
                    </div>
                    <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                        <Button onClick={() => setIsAddTaskModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Tarefa
                        </Button>
                        <AddManualTaskModal 
                            onAddTask={addManualTask}
                            onClose={() => setIsAddTaskModalOpen(false)}
                        />
                    </Dialog>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total de Imóveis</CardTitle><Building className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalProperties}</div><p className="text-xs text-green-600">{stats.availableProperties} disponíveis</p></CardContent></Card>
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Leads Ativos no Funil</CardTitle><Users className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div><p className="text-xs text-gray-600">em aberto</p></CardContent></Card>
                <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total de Projetos</CardTitle><FolderKanban className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div><p className="text-xs text-gray-600">{stats.completedProjects} concluídos</p></CardContent></Card>
            </div>

            <Card className="bg-white shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-800">Sua Missão Diária</CardTitle>
                    <p className="text-gray-500">Tarefas prioritárias para hoje. Foque no que gera mais resultado.</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : pendingTasks.length === 0 ? (
                        <div className="text-center py-16">
                            <Check className="mx-auto h-12 w-12 text-green-500" />
                            <h3 className="mt-2 text-lg font-semibold text-gray-800">Tudo em ordem!</h3>
                            <p className="mt-1 text-gray-500">Nenhuma tarefa pendente para hoje.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {priorityTasks.p1.length > 0 && (
                                <div className="p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-lg">
                                    <h3 className="font-bold text-red-700 mb-2">P1: Oportunidades Novas (Ligue Agora!)</h3>
                                    <div className="divide-y divide-red-200">
                                        {priorityTasks.p1.map(task => <TaskItem key={task.id} task={task} onComplete={completeTask} />)}
                                    </div>
                                </div>
                            )}
                            {priorityTasks.p2.length > 0 && (
                                <div className="p-4 border-l-4 border-orange-500 bg-orange-50/50 rounded-r-lg">
                                    <h3 className="font-bold text-orange-700 mb-2">P2: Acompanhamentos Críticos</h3>
                                    <div className="divide-y divide-orange-200">
                                        {priorityTasks.p2.map(task => <TaskItem key={task.id} task={task} onComplete={completeTask} />)}
                                    </div>
                                </div>
                            )}
                            {priorityTasks.p3.length > 0 && (
                                <div className="p-4 border-l-4 border-blue-500 bg-blue-50/50 rounded-r-lg">
                                    <h3 className="font-bold text-blue-700 mb-2">P3: Organização Pessoal</h3>
                                    <div className="divide-y divide-blue-200">
                                        {priorityTasks.p3.map(task => <TaskItem key={task.id} task={task} onComplete={completeTask} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <div className="px-6 pb-6">
                    <Separator className="my-6" />
                    <div className="text-center">
                        <Button variant="ghost" onClick={() => setShowCompleted(!showCompleted)}>
                            <History className="w-4 h-4 mr-2" />
                            {showCompleted ? "Ocultar Histórico" : "Ver Tarefas Concluídas"}
                        </Button>
                    </div>

                    {showCompleted && (
                        <div className="mt-4">
                            {completedTasks.length === 0 ? (
                                <p className="text-center text-sm text-gray-500">Nenhuma tarefa foi concluída recentemente.</p>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {completedTasks.map(task => <CompletedTaskItem key={task.id} task={task} />)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </main>
    </div>
  );
};

export default Index;