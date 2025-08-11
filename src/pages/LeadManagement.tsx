// src/pages/LeadManagement.tsx
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Filter, Plus, Phone, Mail, AlertCircle, Calendar as CalendarIcon, Loader2, Home, Flame, ThermometerSun, ThermometerSnowflake } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { Lead } from "@/lib/database";
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, OnDragEndResponder } from "@hello-pangea/dnd";

// Componente para o Card de Lead no Kanban
const LeadCard = ({ lead, index }: { lead: Lead; index: number }) => {
  const updatedAt = lead.updated_at ? parseISO(lead.updated_at) : new Date(lead.created_at);
  const daysSinceUpdate = differenceInDays(new Date(), updatedAt);
  const isStagnant = daysSinceUpdate > 7;

  const nextTaskDueDate = lead.next_task?.dueDate ? parseISO(lead.next_task.dueDate) : null;
  const isTaskOverdue = nextTaskDueDate && differenceInDays(new Date(), nextTaskDueDate) > 0;

  const TemperatureIcon = ({ temp }: { temp: Lead['temperature'] }) => {
    switch (temp) {
      case 'QUENTE': return <Flame className="w-4 h-4 text-red-500" />;
      case 'MORNO': return <ThermometerSun className="w-4 h-4 text-yellow-500" />;
      case 'FRIO': return <ThermometerSnowflake className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <Card className="mb-3 bg-white hover:shadow-lg transition-shadow border-l-4 border-transparent data-[temperature=QUENTE]:border-red-500 data-[temperature=MORNO]:border-yellow-500 data-[temperature=FRIO]:border-blue-500" data-temperature={lead.temperature}>
              <CardContent className="p-3">
                <p className="font-bold text-sm text-gray-900 mb-2">{lead.name}</p>
                
                <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center">
                        <TemperatureIcon temp={lead.temperature} />
                        <span className="ml-1.5 font-semibold">{lead.temperature}</span>
                    </div>
                    {lead.phone && (
                        <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1.5 text-gray-400" />
                            <span>{lead.phone}</span>
                        </div>
                    )}
                    {lead.purpose && (
                        <div className="flex items-center">
                            <Home className="w-4 h-4 mr-1.5 text-gray-400" />
                            <span>{lead.purpose} | {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.desired_value || 0)}</span>
                        </div>
                    )}
                </div>
                
                {isStagnant && <div className="flex items-center text-xs text-yellow-600 font-semibold mt-2 pt-2 border-t"><AlertCircle className="w-3 h-3 mr-1.5" />Atenção: Estagnado há {daysSinceUpdate} dias</div>}
              </CardContent>
            </Card>
        </div>
      )}
    </Draggable>
  );
};

const LeadManagement = () => {
  const { stages, leads, loading, error, addLead, updateLeadStage } = useLeads();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOriginDetails, setShowOriginDetails] = useState(false);
  
  const initialFormState = { name: '', email: '', phone: '', temperature: 'MORNO' as Lead['temperature'], purpose: 'Venda' as Lead['purpose'], desired_value: 0, origin: 'Redes Sociais' as Lead['origin'], origin_details: '', notes: '', next_task: null };
  const [newLeadData, setNewLeadData] = useState<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'stage_id'>>(initialFormState);
  const [formattedPrice, setFormattedPrice] = useState("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue === '') {
        setNewLeadData(prev => ({ ...prev, desired_value: null }));
        setFormattedPrice('');
        return;
    }
    const numericValue = Number(rawValue) / 100;
    setNewLeadData(prev => ({ ...prev, desired_value: numericValue }));
    setFormattedPrice(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 11); // Limita a 11 dígitos (DDD + 9 dígitos)
    
    if (value.length > 2) {
      value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }
    if (value.length > 9) {
        value = `${value.substring(0, 10)}-${value.substring(10)}`;
    }
    
    setNewLeadData({...newLeadData, phone: value});
  };

  const handleAddLead = async () => {
    if (!newLeadData.name) {
        toast.error("O nome do lead é obrigatório.");
        return;
    }
    setIsSubmitting(true);
    try {
        await addLead(newLeadData);
        setNewLeadData(initialFormState);
        setFormattedPrice("");
        setIsModalOpen(false);
    } catch(e) {
        console.error("Falha ao adicionar lead:", e);
    } finally {
        setIsSubmitting(false);
    }
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId)) {
      return;
    }
    updateLeadStage(draggableId, destination.droppableId);
  };
  
  const leadsByStage = useMemo(() => {
    const grouped: { [key: string]: Lead[] } = {};
    if (stages && leads) {
        stages.forEach(stage => {
          grouped[stage.id] = leads.filter(lead => lead.stage_id === stage.id);
        });
    }
    return grouped;
  }, [leads, stages]);

  if (loading) return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (error) return <div className="flex h-screen w-full items-center justify-center text-red-600"><p>Erro ao carregar os dados de leads: {error}</p></div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
            <div className="max-w-full mx-auto">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Leads (CRM)</h1>
                        <p className="text-gray-600 mt-1">Gerencie seu funil de vendas de forma visual e proativa.</p>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild><Button className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Adicionar Lead</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-[525px] bg-white"><DialogHeader><DialogTitle>Adicionar Novo Lead</DialogTitle><DialogDescription>Preencha as informações para iniciar o contato.</DialogDescription></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nome *</Label><Input id="name" value={newLeadData.name} onChange={(e) => setNewLeadData({...newLeadData, name: e.target.value})} className="col-span-3" placeholder="Nome completo do lead"/></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="phone" className="text-right">Telefone</Label><Input id="phone" value={newLeadData.phone ?? ''} onChange={handlePhoneChange} className="col-span-3" placeholder="(31) 99999-9999"/></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="email" className="text-right">Email</Label><Input id="email" type="email" value={newLeadData.email ?? ''} onChange={(e) => setNewLeadData({...newLeadData, email: e.target.value})} className="col-span-3" placeholder="email@exemplo.com"/></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="purpose" className="text-right">Finalidade</Label><Select value={newLeadData.purpose ?? undefined} onValueChange={(value: Lead['purpose']) => setNewLeadData({...newLeadData, purpose: value})}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Venda">Venda</SelectItem><SelectItem value="Aluguel">Aluguel</SelectItem></SelectContent></Select></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="desired_value" className="text-right">Orçamento</Label><Input id="desired_value" value={formattedPrice} onChange={handlePriceChange} className="col-span-3" placeholder="R$ 0,00"/></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="origin" className="text-right">Canal</Label><Select value={newLeadData.origin ?? undefined} onValueChange={(value: string) => {setShowOriginDetails(value === 'Indicação'); setNewLeadData({...newLeadData, origin: value})}}><SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Redes Sociais">Redes Sociais</SelectItem><SelectItem value="Indicação">Indicação</SelectItem><SelectItem value="Portal Imobiliário">Portal Imobiliário</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent></Select></div>
                                {showOriginDetails && <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="origin_details" className="text-right">Indicado por</Label><Input id="origin_details" value={newLeadData.origin_details ?? ''} onChange={(e) => setNewLeadData({...newLeadData, origin_details: e.target.value})} className="col-span-3" placeholder="Nome de quem indicou"/></div>}
                                <div className="grid grid-cols-4 items-start gap-4"><Label htmlFor="notes" className="text-right pt-2">Anotações</Label><Textarea id="notes" value={newLeadData.notes ?? ''} onChange={(e) => setNewLeadData({...newLeadData, notes: e.target.value})} className="col-span-3" placeholder="Detalhes importantes sobre o lead..."/></div>
                            </div>
                            <DialogFooter><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button><Button onClick={handleAddLead} className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isSubmitting ? "Salvando..." : "Salvar Lead"}</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {stages.map(stage => (
                        <Droppable droppableId={stage.id} key={stage.id}>
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 rounded-lg shadow-sm flex flex-col h-[calc(100vh-18rem)]">
                                    <div className="p-3 border-b bg-white rounded-t-lg"><h3 className="font-semibold text-gray-800">{stage.name} <span className="text-sm font-normal text-gray-500">{leadsByStage[stage.id]?.length || 0}</span></h3></div>
                                    <div className="p-2 flex-1 overflow-y-auto">
                                        {(leadsByStage[stage.id] || []).map((lead, index) => <LeadCard key={lead.id} lead={lead} index={index} />)}
                                        {provided.placeholder}
                                        {(leadsByStage[stage.id] || []).length === 0 && (
                                            <div className="text-center pt-10 text-xs text-gray-500">Nenhum lead nesta etapa.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </div>
        </div>
    </DragDropContext>
  );
};

export default LeadManagement;