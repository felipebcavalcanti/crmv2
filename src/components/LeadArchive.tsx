// src/components/LeadArchive.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Inbox, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/lib/database';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { LeadDetailsModal } from './LeadDetailsModal';
import { cn } from '@/lib/utils';

export const LeadArchive = () => {
  const { getInactiveLeads, searchLeads, updateLeadOutcome } = useLeads();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'Ganho' | 'Perdido'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let result;
    if (searchQuery) {
      result = await searchLeads(searchQuery, filter === 'all' ? null : filter);
    } else {
      result = await getInactiveLeads(filter);
    }

    if (result.success && result.data) {
      setLeads(result.data);
    } else {
      toast.error("Erro ao buscar leads", { description: result.error });
    }
    setLoading(false);
  }, [searchQuery, filter, getInactiveLeads, searchLeads]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReactivate = async (leadId: string) => {
    await updateLeadOutcome(leadId, 'Ativo', {});
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleOpenDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedLead(null);
  };
  
  const OutcomeBadge = ({ outcome }: { outcome: Lead['outcome'] }) => {
    if (outcome === 'Ganho') {
      return <Badge className="bg-green-100 text-green-800 border border-green-200"><ThumbsUp className="w-3 h-3 mr-1"/> Ganho</Badge>;
    }
    if (outcome === 'Perdido') {
      return <Badge variant="destructive"><ThumbsDown className="w-3 h-3 mr-1"/> Perdido</Badge>;
    }
    return <Badge variant="outline">Ativo</Badge>;
  };

  return (
    <>
        <Card className="mt-8 w-full">
            <CardHeader>
                <CardTitle className="text-xl">Arquivo e Pesquisa Global de Leads</CardTitle>
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Pesquisar por nome, email ou telefone..." 
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            onClick={() => setFilter('all')}
                            className={cn(filter === 'all' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-transparent text-gray-700 border-gray-300')}
                            variant={filter === 'all' ? 'default' : 'outline'}>
                            Todos Inativos
                        </Button>
                        <Button 
                            onClick={() => setFilter('Ganho')}
                            className={cn(filter === 'Ganho' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-transparent text-gray-700 border-gray-300')}
                            variant={filter === 'Ganho' ? 'default' : 'outline'}>
                            Ganhos
                        </Button>
                        <Button 
                            onClick={() => setFilter('Perdido')}
                            className={cn(filter === 'Perdido' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-transparent text-gray-700 border-gray-300')}
                             variant={filter === 'Perdido' ? 'default' : 'outline'}>
                            Perdidos
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
                ) : leads.length === 0 ? (
                    <div className="text-center py-16 px-6">
                        <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-semibold text-gray-800">Nenhum lead encontrado</h3>
                        <p className="mt-1 text-gray-500">
                            {searchQuery ? "Tente uma busca diferente." : "Ainda não há leads ganhos ou perdidos."}
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Nome</TableHead>
                                    <TableHead className="whitespace-nowrap">Status</TableHead>
                                    <TableHead className="whitespace-nowrap">Contato</TableHead>
                                    <TableHead className="text-right whitespace-nowrap">Última Atualização</TableHead>
                                    <TableHead className="text-center whitespace-nowrap">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map(lead => (
                                    <TableRow key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenDetails(lead)}>
                                        <TableCell className="font-medium">{lead.name}</TableCell>
                                        <TableCell><OutcomeBadge outcome={lead.outcome} /></TableCell>
                                        <TableCell>{lead.email || lead.phone}</TableCell>
                                        <TableCell className="text-right">{format(parseISO(lead.updated_at), "dd/MM/yyyy")}</TableCell>
                                        <TableCell className="text-center">
                                            {lead.outcome !== null && ( // Renderiza se não for ativo
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={(e) => { e.stopPropagation(); handleReactivate(lead.id); }}
                                                    // ESTILO DO BOTÃO CORRIGIDO
                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 font-semibold"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Reativar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <LeadDetailsModal 
                lead={selectedLead} 
                onClose={handleCloseDetails}
                onMarkAsWon={() => {}}
                onMarkAsLost={() => {}}
            />
        </Dialog>
    </>
  );
};