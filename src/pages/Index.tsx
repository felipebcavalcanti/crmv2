// src/pages/Index.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BarChart3, FolderOpen, Users, Calendar as CalendarIcon2, TrendingUp, Filter, Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "./Index"; // Mantendo a interface aqui por enquanto
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// As interfaces devem ser centralizadas em um arquivo de tipos no futuro, mas mantemos aqui por simplicidade no momento.
export interface WeeklyTracking {
  week: string;
  progress: number;
  notes: string;
  blockers: string[];
}

export interface Checkpoint {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectImage {
  id: string;
  url: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  allocations: string[];
  deliveryDate: Date;
  status: "planning" | "in-progress" | "review" | "completed";
  progress: number;
  weeklyTracking: WeeklyTracking[];
  notes: string;
  priority: "low" | "medium" | "high";
  checkpoints?: Checkpoint[];
  images?: ProjectImage[];
  backgroundImage?: string;
}

const Index = () => {
  // Hook para buscar os dados reais dos projetos
  const { projects, loading, error } = useProjects();
  
  // Estados para os filtros
  const [statusFilter, setStatusFilter] = useState("all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  // Memoiza os projetos filtrados para evitar recálculos desnecessários
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const statusMatch = statusFilter === 'all' || project.status === statusFilter;
      // Lógica de filtro por responsável (exemplo, requer 'responsible' no modelo)
      // const responsibleMatch = responsibleFilter === 'all' || project.responsible === responsibleFilter;
      // Lógica de filtro por período (exemplo)
      const periodMatch = periodFilter === 'all'; // Implementar lógica de data aqui

      return statusMatch && periodMatch;
    });
  }, [projects, statusFilter, responsibleFilter, periodFilter]);

  // DERIVED STATE: Cálculos e dados para gráficos são derivados do estado filtrado
  const stats = {
    totalProjects: filteredProjects.length,
    inProgress: filteredProjects.filter(p => p.status === "in-progress").length,
    completed: filteredProjects.filter(p => p.status === "completed").length,
    overdue: filteredProjects.filter(p => new Date(p.deliveryDate) < new Date() && p.status !== "completed").length
  };

  const statusData = [
    { name: 'Planejamento', value: filteredProjects.filter(p => p.status === 'planning').length, color: '#8884d8' },
    { name: 'Em Andamento', value: filteredProjects.filter(p => p.status === 'in-progress').length, color: '#82ca9d' },
    { name: 'Em Revisão', value: filteredProjects.filter(p => p.status === 'review').length, color: '#ffc658' },
    { name: 'Concluído', value: filteredProjects.filter(p => p.status === 'completed').length, color: '#ff7300' }
  ];

  const progressData = filteredProjects.map(p => ({
    name: p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''),
    progresso: p.progress
  }));

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-red-600">
        <p>Erro ao carregar os dados do dashboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm">Visão geral e estatísticas dos seus projetos.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-8 shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="w-5 h-5" />
                    Filtros
                </CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="status" className="text-xs font-semibold">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="planning">Planejamento</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="responsible" className="text-xs font-semibold">Responsável</Label>
                <Select value={responsibleFilter} onValueChange={setResponsibleFilter} disabled>
                  <SelectTrigger id="responsible">
                    <SelectValue placeholder="Em breve" />
                  </SelectTrigger>
                  {/* Popular com dados reais no futuro */}
                </Select>
              </div>
              <div>
                <Label htmlFor="period" className="text-xs font-semibold">Período</Label>
                 <Input id="period" type="date" disabled />
              </div>
               <div className="self-end">
                 <Button className="w-full bg-blue-600 hover:bg-blue-700">Aplicar</Button>
               </div>
            </div>
          </CardContent>
        </Card>
      
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Projetos</CardTitle>
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Em Andamento</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Concluídos</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Atrasados</CardTitle>
              <CalendarIcon2 className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Progresso dos Projetos (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
                  <Bar dataKey="progresso" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;