// src/pages/ArchivedLeads.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, User, Inbox, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/lib/database';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const ArchivedLeads = () => {
  const { getInactiveLeads, searchLeads, updateLeadOutcome } = useLeads();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'Ganho' | 'Perdido'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    let result;
    if (searchQuery) {
      result = await searchLeads(searchQuery);
    } else {
      result = await getInactiveLeads();
    }

    if (result.success && result.data) {
      let filteredData = result.data;
      if (filter !== 'all') {
        filteredData = result.data.filter(lead => lead.outcome === filter);
      }
      setLeads(filteredData);
    } else {
      toast.error("Erro ao buscar leads", { description: result.error });
    }
    setLoading(false);
  }, [searchQuery, filter, getInactiveLeads, searchLeads]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReactivate = async (leadId: string) => {
    await updateLeadOutcome(leadId, 'Ativo');
    // A lógica no hook já remove o lead da lista de inativos, então apenas atualizamos a UI
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const OutcomeBadge = ({ outcome }: { outcome: Lead['outcome'] }) => {
    if (outcome === 'Ganho') {
      return <Badge className="bg-green-100 text-green-800"><ThumbsUp className="w-3 h-3 mr-1"/> Ganho</Badge>;
    }
    return <Badge variant="destructive"><ThumbsDown className="w-3 h-3 mr-1"/> Perdido</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Arquivo de Leads</h1>
                <p className="text-gray-600 mt-1">Pesquise, filtre e reative leads ganhos ou perdidos.</p>
            </div>
        </div>

        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
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
                        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todos</Button>
                        <Button variant={filter === 'Ganho' ? 'default' : 'outline'} onClick={() => setFilter('Ganho')}>Ganhos</Button>
                        <Button variant={filter === 'Perdido' ? 'default' : 'outline'} onClick={() => setFilter('Perdido')}>Perdidos</Button>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead className="text-right">Última Atualização</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.name}</TableCell>
                                    <TableCell><OutcomeBadge outcome={lead.outcome} /></TableCell>
                                    <TableCell>{lead.email || lead.phone}</TableCell>
                                    <TableCell className="text-right">{format(parseISO(lead.updated_at), "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="text-center">
                                        <Button variant="outline" size="sm" onClick={() => handleReactivate(lead.id)}>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Reativar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArchivedLeads;