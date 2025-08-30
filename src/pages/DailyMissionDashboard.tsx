// src/pages/DailyMissionDashboard.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, AlertCircle, Flag } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/lib/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// Componente para um item da lista de tarefas
const TaskItem = ({ task, onComplete }: { task: Task; onComplete: (taskId: string) => void }) => {
    const priorityColors = {
        'Alta': 'bg-red-500',
        'Média': 'bg-yellow-500',
        'Baixa': 'bg-blue-500',
    };

    return (
        <div className="flex items-center space-x-4 p-3 border-b border-border hover:bg-accent/50 transition-colors">
            <Checkbox id={`task-${task.id}`} onCheckedChange={() => onComplete(task.id)} />
            <div className="flex-1">
                <p className="font-medium text-foreground">{task.title}</p>
                {task.lead_id && <p className="text-xs text-muted-foreground">Associado ao lead: [Nome do Lead]</p>}
            </div>
            <div className="flex items-center gap-4">
                {task.due_date && (
                    <Badge variant="outline" className="text-xs">
                        Vence em: {format(new Date(task.due_date), "dd/MM/yyyy")}
                    </Badge>
                )}
                <div className="flex items-center gap-2 w-20">
                    <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]}`}></div>
                    <span className="text-sm font-semibold">{task.priority}</span>
                </div>
            </div>
        </div>
    );
};

const DailyMissionDashboard = () => {
    const { tasks, loading, error, addTask, completeTask } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const initialFormState = { title: '', priority: 'Média' as Task['priority'], due_date: '' };
    const [newTaskData, setNewTaskData] = useState(initialFormState);

    const handleAddTask = async () => {
        if (!newTaskData.title) {
            toast.error("O título da tarefa é obrigatório.");
            return;
        }
        setIsSubmitting(true);
        try {
            await addTask({
                title: newTaskData.title,
                priority: newTaskData.priority,
                due_date: newTaskData.due_date || null
            });
            setNewTaskData(initialFormState);
            setIsModalOpen(false);
        } catch (e) {
            console.error("Falha ao adicionar tarefa:", e);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (error) {
        return <div className="flex h-screen w-full items-center justify-center text-destructive"><p>Erro ao carregar a Missão Diária: {error}</p></div>;
    }

    return (
        <div className="dark min-h-screen bg-background p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Missão Diária</h1>
                        <p className="text-muted-foreground mt-1">Sua lista de tarefas priorizadas para hoje.</p>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Nova Tarefa Manual</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-card border-border">
                            <DialogHeader>
                                <DialogTitle>Nova Tarefa Manual</DialogTitle>
                                <DialogDescription>Adicione uma nova tarefa à sua lista.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="title" className="text-right">Tarefa *</Label>
                                    <Input id="title" value={newTaskData.title} onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})} className="col-span-3" placeholder="Ex: Ligar para o cartório"/>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="priority" className="text-right">Prioridade</Label>
                                    <Select value={newTaskData.priority} onValueChange={(value: Task['priority']) => setNewTaskData({...newTaskData, priority: value})}>
                                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Alta">Alta</SelectItem>
                                            <SelectItem value="Média">Média</SelectItem>
                                            <SelectItem value="Baixa">Baixa</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="due_date" className="text-right">Vencimento</Label>
                                    <Input id="due_date" type="date" value={newTaskData.due_date} onChange={(e) => setNewTaskData({...newTaskData, due_date: e.target.value})} className="col-span-3"/>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button onClick={handleAddTask} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isSubmitting ? "Salvando..." : "Salvar Tarefa"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Flag />
                            Lista de Tarefas ({tasks.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {tasks.length > 0 ? (
                            <div>
                                {tasks.map(task => (
                                    <TaskItem key={task.id} task={task} onComplete={completeTask} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 px-6">
                                <h3 className="text-lg font-semibold text-foreground">Tudo em ordem!</h3>
                                <p className="text-muted-foreground mt-2">Você não tem tarefas pendentes na sua lista. Bom trabalho!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DailyMissionDashboard;