// src/components/LeadDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lead, LeadEvent } from "@/lib/database";
import { User, Mail, Phone, Home, DollarSign, Tag, Flame, ThermometerSun, ThermometerSnowflake, FileText, Edit, X, ThumbsUp, ThumbsDown, History } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLeads } from '@/hooks/useLeads'; // Importar o hook para buscar eventos

interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
  onMarkAsWon: (leadId: string) => void;
  onMarkAsLost: (leadId: string) => void;
}

const TemperatureIcon = ({ temp }: { temp: Lead['temperature'] }) => {
    switch (temp) {
      case 'QUENTE': return <Flame className="w-4 h-4 text-red-500" />;
      case 'MORNO': return <ThermometerSun className="w-4 h-4 text-yellow-500" />;
      case 'FRIO': return <ThermometerSnowflake className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
};

const TemperatureInfo = ({ temp }: { temp: Lead['temperature'] }) => {
    if (!temp) return null;
    const color = temp === 'QUENTE' ? 'text-red-500' : temp === 'MORNO' ? 'text-yellow-500' : 'text-blue-500';
    return <div className="flex items-center gap-2"><TemperatureIcon temp={temp} /><span className={`font-semibold ${color}`}>{temp.charAt(0).toUpperCase() + temp.slice(1).toLowerCase()}</span></div>;
};

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => {
    if (!value && typeof value !== 'number') return null;
    return (
        <div className="flex items-start text-sm">
            <div className="flex-shrink-0 w-6 mt-0.5 text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-muted-foreground break-words">{value}</p>
            </div>
        </div>
    );
};

// NOVO: Componente para exibir um evento do histórico
const EventItem = ({ event }: { event: LeadEvent }) => {
    return (
        <div className="flex items-start space-x-3 py-2">
            <div className="flex-shrink-0 pt-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{event.event_type}</p>
                <p className="text-xs text-muted-foreground">{format(parseISO(event.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
            </div>
        </div>
    );
};

export const LeadDetailsModal = ({ lead, onClose, onMarkAsWon, onMarkAsLost }: LeadDetailsModalProps) => {
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const { fetchLeadEvents } = useLeads();

  useEffect(() => {
    if (lead?.id) {
        const loadEvents = async () => {
            const fetchedEvents = await fetchLeadEvents(lead.id);
            setEvents(fetchedEvents);
        };
        loadEvents();
    } else {
        setEvents([]); // Limpa os eventos se não houver lead
    }
  }, [lead, fetchLeadEvents]);

  if (!lead) return null;

  // Verifica se o lead está ativo (sem resultado definido)
  const isLeadActive = !lead.outcome;

  return (
    <DialogContent className="sm:max-w-lg bg-background">
      <DialogHeader>
        <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {lead.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
                <DialogDescription>Ficha completa do lead</DialogDescription>
            </div>
        </div>
      </DialogHeader>
      
      {/* Container principal com rolagem */}
      <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2">
            <DetailRow icon={<Mail size={16} />} label="Email" value={lead.email || "Não informado"} />
            <DetailRow icon={<Phone size={16} />} label="Telefone" value={lead.phone || "Não informado"} />
            <DetailRow icon={<Flame size={16} />} label="Temperatura" value={<TemperatureInfo temp={lead.temperature} />} />
            <DetailRow icon={<Tag size={16} />} label="Canal de Aquisição" value={lead.origin ? `${lead.origin}${lead.origin_details ? ` (${lead.origin_details})` : ''}` : "Não informado"} />
            <DetailRow icon={<Home size={16} />} label="Finalidade" value={lead.purpose || "Não informada"} />
            <DetailRow icon={<DollarSign size={16} />} label="Orçamento" value={lead.desired_value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.desired_value) : "Não informado"} />
        </div>
        <Separator />
        <DetailRow icon={<FileText size={16} />} label="Anotações" value={lead.notes || "Nenhuma anotação."} />
        <Separator />

        {/* NOVO: Seção de Histórico do Lead */}
        <div>
            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                <History className="w-4 h-4 mr-2 text-muted-foreground" />
                Histórico de Atividades
            </h3>
            <div className="relative pl-4 border-l-2 border-border">
                {events.length > 0 ? (
                    events.map(event => <EventItem key={event.id} event={event} />)
                ) : (
                    <p className="text-xs text-muted-foreground py-2">Nenhum evento registrado.</p>
                )}
            </div>
        </div>
      </div>
      
      <DialogFooter className="justify-between sm:justify-between pt-4 border-t">
        <Button variant="ghost" onClick={onClose}><X className="w-4 h-4 mr-2"/>Fechar</Button>
        
        {/* CORREÇÃO: Botões de Ganho/Perda aparecem apenas para leads ativos */}
        {isLeadActive && (
            <div className="flex gap-2">
                <Button variant="destructive" onClick={() => onMarkAsLost(lead.id)}>
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Perda
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onMarkAsWon(lead.id)}>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Ganho
                </Button>
            </div>
        )}
      </DialogFooter>
    </DialogContent>
  );
};