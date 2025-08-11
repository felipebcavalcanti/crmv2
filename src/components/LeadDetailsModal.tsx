// src/components/LeadDetailsModal.tsx
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lead } from "@/lib/database";
import { User, Mail, Phone, Home, DollarSign, Tag, Flame, ThermometerSun, ThermometerSnowflake, FileText, Edit, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
}

// Componente de Ícone de Temperatura, agora definido dentro deste arquivo
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
    switch (temp) {
      case 'QUENTE': return <div className="flex items-center gap-2"><TemperatureIcon temp={temp} /><span className="font-semibold text-red-500">Quente</span></div>;
      case 'MORNO': return <div className="flex items-center gap-2"><TemperatureIcon temp={temp} /><span className="font-semibold text-yellow-500">Morno</span></div>;
      case 'FRIO': return <div className="flex items-center gap-2"><TemperatureIcon temp={temp} /><span className="font-semibold text-blue-500">Frio</span></div>;
      default: return <div className="flex items-center gap-2"><span className="font-semibold text-gray-500">{temp}</span></div>;
    }
};

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => {
    if (!value && typeof value !== 'number') return null;
    return (
        <div className="flex items-start text-sm">
            <div className="flex-shrink-0 w-6 mt-0.5 text-gray-500">{icon}</div>
            <div className="flex-1">
                <p className="font-semibold text-gray-800">{label}</p>
                <p className="text-gray-600 break-words">{value}</p>
            </div>
        </div>
    );
};

export const LeadDetailsModal = ({ lead, onClose }: LeadDetailsModalProps) => {
  if (!lead) return null;

  return (
    <DialogContent className="sm:max-w-lg bg-white">
      <DialogHeader>
        <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
                <AvatarFallback className="text-xl bg-blue-100 text-blue-700">
                    {lead.name.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div>
                <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
                <DialogDescription>Ficha completa do lead</DialogDescription>
            </div>
        </div>
      </DialogHeader>
      
      <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <Separator />
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
        <div className="text-xs text-gray-400 text-center">
            Lead criado em: {format(parseISO(lead.created_at), "dd/MM/yyyy 'às' HH:mm")}
        </div>
      </div>
      
      <DialogFooter className="justify-between sm:justify-between">
        <Button variant="ghost" onClick={onClose}><X className="w-4 h-4 mr-2"/>Fechar</Button>
        <Button className="bg-blue-600 hover:bg-blue-700" disabled><Edit className="w-4 h-4 mr-2"/>Editar (em breve)</Button>
      </DialogFooter>
    </DialogContent>
  );
};