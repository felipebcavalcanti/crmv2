import { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Project } from "@/pages/Index";

interface EditProjectModalProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

export const EditProjectModal = ({ project, onUpdate }: EditProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    deliveryDate: new Date(project.deliveryDate),
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    notes: project.notes
  });
  
  const [allocations, setAllocations] = useState<string[]>(project.allocations);
  const [newAllocation, setNewAllocation] = useState("");

  const handleAddAllocation = () => {
    if (newAllocation.trim() && !allocations.includes(newAllocation.trim())) {
      setAllocations([...allocations, newAllocation.trim()]);
      setNewAllocation("");
    }
  };

  const handleRemoveAllocation = (index: number) => {
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.deliveryDate) {
      return;
    }

    const updatedProject: Project = {
      ...project,
      name: formData.name,
      description: formData.description,
      allocations,
      deliveryDate: formData.deliveryDate,
      status: formData.status,
      progress: formData.progress,
      notes: formData.notes,
      priority: formData.priority
    };

    onUpdate(updatedProject);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
      <DialogHeader>
        <DialogTitle>Editar Projeto</DialogTitle>
        <DialogDescription>
          Modifique as informações do projeto.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome do Projeto */}
        <div>
          <Label htmlFor="name">Nome do Projeto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Digite o nome do projeto"
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o projeto"
            rows={3}
          />
        </div>

        {/* Status e Prioridade */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Project["status"]) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="review">Em Revisão</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Prioridade</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: Project["priority"]) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progresso */}
        <div>
          <Label>Progresso: {formData.progress}%</Label>
          <Slider
            value={[formData.progress]}
            onValueChange={(value) => setFormData({ ...formData, progress: value[0] })}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>

        {/* Data de Entrega */}
        <div>
          <Label>Data de Entrega *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.deliveryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.deliveryDate ? (
                  format(formData.deliveryDate, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white" align="start">
              <Calendar
                mode="single"
                selected={formData.deliveryDate}
                onSelect={(date) => date && setFormData({ ...formData, deliveryDate: date })}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Alocações */}
        <div>
          <Label>Alocações</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newAllocation}
              onChange={(e) => setNewAllocation(e.target.value)}
              placeholder="Nome da pessoa"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAllocation())}
            />
            <Button type="button" onClick={handleAddAllocation} variant="outline">
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allocations.map((person, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
              >
                {person}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-blue-600"
                  onClick={() => handleRemoveAllocation(index)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Notas */}
        <div>
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionais sobre o projeto"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};