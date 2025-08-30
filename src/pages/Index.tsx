// src/pages/Index.tsx
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Zap, AlertTriangle, ListTodo, Building, Users, FolderKanban, Plus, History, TrendingUp } from "lucide-react";
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
        alta: { icon: Zap, color: "text-destructive", badge: "destructive" },
        media: { icon: AlertTriangle, color: "text-primary", badge: "default" },
        baixa: { icon: ListTodo, color: "text-muted-foreground", badge: "secondary" },
    };
    const config = priorityConfig[task.priority] || priorityConfig.baixa;
    const Icon = config.icon;
    const leadName = task.leads?.name;

    return (
        <div className="flex items-center p-4 transition-colors hover:bg-accent/50 rounded-lg border border-border/50 group">
            <div className="mr-4 flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-muted group-hover:bg-accent transition-colors">
                <Icon className={`w-5 h-5 ${config.color}`} />
            </div>

            <div className="flex-grow space-y-1">
                <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <Badge variant={config.badge as "destructive" | "default" | "secondary" | "outline"} className="text-xs">
                        {task.priority.toUpperCase()}
                    </Badge>
                </div>
                {leadName && <p className="text-sm text-muted-foreground">Lead: {leadName}</p>}
            </div>

            <Button size="sm" variant="outline" onClick={() => onComplete(task.id)} className="ml-4 hover:bg-primary hover:text-primary-foreground transition-colors">
                <Check className="w-4 h-4" />
            </Button>
        </div>
    );
};

// Componente para um item de tarefa CONCLUÍDA
const CompletedTaskItem = ({ task }: { task: Task & { leads?: { name: string } | null }}) => {
    const leadName = task.leads?.name;
    return (
        <div className="flex items-center p-4 border border-border/30 rounded-lg opacity-60 hover:opacity-80 transition-opacity">
            <div className="mr-4 flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                </div>
            </div>
            <div className="flex-grow space-y-1">
                <p className="text-muted-foreground line-through font-medium">{task.title}</p>
                {leadName && <p className="text-sm text-muted-foreground/70">Lead: {leadName}</p>}
            </div>
            <div className="ml-4 text-sm text-muted-foreground">
                {task.completed_at ? format(parseISO(task.completed_at), 'dd/MM', { locale: ptBR }) : ''}
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
    <div className="min-h-screen bg-background dark">
        <header className="bg-card shadow-sm border-b border-primary/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">Sua Missão Diária e visão geral do negócio.</p>
                    </div>
                    <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
                        <Button 
                            onClick={() => setIsAddTaskModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
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
                <Card className="bg-card border-border hover:bg-accent/5 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total de Imóveis</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalProperties}
                        </div>
                        <p className="text-xs text-green-500 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {stats.availableProperties} disponíveis
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-card border-border hover:bg-accent/5 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Leads Ativos no Funil
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalLeads}
                        </div>
                        <p className="text-xs text-muted-foreground">em aberto</p>
                    </CardContent>
                </Card>
                
                <Card className="bg-card border-border hover:bg-accent/5 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total de Projetos
                        </CardTitle>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <FolderKanban className="h-4 w-4 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-foreground">
                            {stats.totalProjects}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {stats.completedProjects} concluídos
                        </p> 
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-foreground">Sua Missão Diária</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Tarefas prioritárias para hoje. Foque no que gera mais resultado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : pendingTasks.length === 0 ? (
                        <div className="text-center py-16 space-y-4">
                            <div className="h-16 w-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                                <Check className="h-8 w-8 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">Tudo em ordem!</h3>
                                <p className="text-muted-foreground">Nenhuma tarefa pendente para hoje.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {priorityTasks.p1.length > 0 && (
                                <div className="p-6 border-l-4 border-destructive bg-destructive/5 rounded-r-lg space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive" className="font-semibold">P1</Badge>
                                        <h3 className="font-bold text-foreground">Oportunidades Novas (Ligue Agora!)</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {priorityTasks.p1.map(task => <TaskItem key={task.id} task={task} onComplete={completeTask} />)}
                                    </div>
                                </div>
                            )}
                            {priorityTasks.p2.length > 0 && (
                                <div className="p-6 border-l-4 border-primary bg-primary/5 rounded-r-lg space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="default" className="font-semibold">P2</Badge>
                                        <h3 className="font-bold text-foreground">Acompanhamentos Críticos</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {priorityTasks.p2.map(task => <TaskItem key={task.id} task={task} onComplete={completeTask} />)}
                                    </div>
                                </div>
                            )}
                            {priorityTasks.p3.length > 0 && (
                                <div className="p-6 border-l-4 border-muted-foreground bg-muted/30 rounded-r-lg space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-semibold">P3</Badge>
                                        <h3 className="font-bold text-foreground">Organização Pessoal</h3>
                                    </div>
                                    <div className="space-y-3">
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
                        <Button variant="ghost" onClick={() => setShowCompleted(!showCompleted)} className="text-muted-foreground hover:text-foreground">
                            <History className="w-4 h-4 mr-2" />
                            {showCompleted ? "Ocultar Histórico" : "Ver Tarefas Concluídas"}
                        </Button>
                    </div>

                    {showCompleted && (
                        <div className="mt-6 space-y-4">
                            {completedTasks.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">Nenhuma tarefa foi concluída recentemente.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
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