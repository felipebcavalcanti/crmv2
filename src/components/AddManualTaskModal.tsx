// src/components/AddManualTaskModal.tsx
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/database";
import { toast } from 'sonner';

interface AddManualTaskModalProps {
  onAddTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status' | 'type' | 'completed_at' | 'leads'>) => Promise<boolean>;
  onClose: () => void;
}

export const AddManualTaskModal = ({ onAddTask, onClose }: AddManualTaskModalProps) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
  const [priority, setPriority] = useState<Task['priority']>('baixa');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate) {
      toast.error("Título e data são obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    const success = await onAddTask({
        title,
        due_date: format(dueDate, "yyyy-MM-dd"),
        priority,
        lead_id: null,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-background">
      <DialogHeader>
        <DialogTitle>Adicionar Tarefa Manual</DialogTitle>
        <DialogDescription>
          Crie uma nova tarefa para a sua "Missão Diária".
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Título *
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="col-span-3"
            placeholder="Ex: Ligar para o cartório"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="dueDate" className="text-right">
            Data *
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "col-span-3 justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Escolha uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="priority" className="text-right">
            Prioridade
          </Label>
          <Select value={priority} onValueChange={(value: Task['priority']) => setPriority(value)}>
            <SelectTrigger className="col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          {/* BOTÃO ESTILIZADO COM A COR PRIMÁRIA DO CRM */}
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Tarefa
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};