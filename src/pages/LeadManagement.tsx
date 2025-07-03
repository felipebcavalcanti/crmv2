import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Mail, Filter } from "lucide-react";

const LeadManagement = () => {
  const [leads] = useState([
    {
      id: 1,
      name: "João Silva",
      contact: "joao@email.com",
      status: "Qualificação",
      lastInteraction: "Ontem",
      responsible: "Maria Pereira"
    },
    {
      id: 2,
      name: "Luciana Alves",
      contact: "luciana@email.com", 
      status: "Negociação",
      lastInteraction: "Hoje",
      responsible: "Carlos Santos"
    }
  ]);

  const [selectedLead, setSelectedLead] = useState(leads[0]);

  const salesFunnel = [
    { stage: "Captura", count: 1, leads: ["João Silva"] },
    { stage: "Qualificação", count: 1, leads: ["Luciana Alves"] },
    { stage: "Negociação", count: 0, leads: [] },
    { stage: "Fechamento", count: 0, leads: [] }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-8 bg-blue-600 text-white">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">CRM - Gestão de Leads</CardTitle>
                <p className="text-blue-100">Gerencie seus leads e acompanhe o funil de vendas.</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="entryDate">Data de Entrada:</Label>
                <Input id="entryDate" type="date" />
              </div>
              <div className="w-40">
                <Label htmlFor="origin">Origem:</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Contato</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Última Interação</th>
                    <th className="text-left py-3 px-4">Corretor Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className={`border-b hover:bg-gray-50 cursor-pointer ${selectedLead.id === lead.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="py-4 px-4 font-medium">{lead.name}</td>
                      <td className="py-4 px-4">{lead.contact}</td>
                      <td className="py-4 px-4">
                        <Badge variant={lead.status === "Qualificação" ? "default" : "secondary"}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">{lead.lastInteraction}</td>
                      <td className="py-4 px-4">{lead.responsible}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Detalhes do Lead</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Histórico de Interações</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Ligação: Interessado em imóveis na região central.</li>
                    <li>• E-mail enviado com propostas.</li>
                    <li>• Visita agendada para a próxima semana.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Ações Rápidas</h3>
                  <div className="flex gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Visita
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Funil de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesFunnel.map((stage) => (
                  <div key={stage.stage} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{stage.stage}</h3>
                      <Badge variant="outline">{stage.count}</Badge>
                    </div>
                    {stage.leads.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {stage.leads.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeadManagement;