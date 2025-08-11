// src/pages/Index.tsx
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BarChart3, FolderOpen, Users, Calendar as CalendarIcon2, TrendingUp, Filter, Loader2, Building } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { useProperties } from "@/hooks/useProperties";
import { useLeads } from "@/hooks/useLeads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// As interfaces agora devem ser importadas de seus respectivos hooks ou da camada de dados
export type { Project, WeeklyTracking, Checkpoint, ProjectImage } from "@/hooks/useProjects";
export type { Property } from "@/lib/database";
export type { Lead } from "@/lib/database";

const Index = () => {
  const { projects, loading: loadingProjects, error: projectsError } = useProjects();
  const { properties, loading: loadingProperties, error: propertiesError } = useProperties();
  const { leads, loading: loadingLeads, error: leadsError } = useLeads();
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [responsibleFilter, setResponsibleFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  const loading = loadingProjects || loadingProperties || loadingLeads;
  const error = projectsError || propertiesError || leadsError;

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const statusMatch = statusFilter === 'all' || project.status === statusFilter;
      return statusMatch;
    });
  }, [projects, statusFilter]);

  const stats = useMemo(() => ({
    totalProjects: filteredProjects.length,
    inProgress: filteredProjects.filter(p => p.status === "in-progress").length,
    completed: filteredProjects.filter(p => p.status === "completed").length,
    overdue: filteredProjects.filter(p => new Date(p.deliveryDate) < new Date() && p.status !== "completed").length,
    totalProperties: properties.length,
    availableProperties: properties.filter(p => p.status === 'Disponível').length,
    totalLeads: leads.length,
    activeLeads: leads.filter(l => l.status !== 'fechamento').length,
  }), [filteredProjects, properties, leads]);

  const statusData = useMemo(() => [
    { name: 'Planejamento', value: filteredProjects.filter(p => p.status === 'planning').length, color: '#8884d8' },
    { name: 'Em Andamento', value: filteredProjects.filter(p => p.status === 'in-progress').length, color: '#82ca9d' },
    { name: 'Em Revisão', value: filteredProjects.filter(p => p.status === 'review').length, color: '#ffc658' },
    { name: 'Concluído', value: filteredProjects.filter(p => p.status === 'completed').length, color: '#ff7300' }
  ], [filteredProjects]);

  const priorityData = useMemo(() => [
    { name: 'Baixa', value: filteredProjects.filter(p => p.priority === 'low').length },
    { name: 'Média', value: filteredProjects.filter(p => p.priority === 'medium').length },
    { name: 'Alta', value: filteredProjects.filter(p => p.priority === 'high').length }
  ], [filteredProjects]);

  const progressData = useMemo(() => filteredProjects.map(p => ({
    name: p.name.substring(0, 10) + '...',
    progress: p.progress
  })), [filteredProjects]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visualize o progresso e estatísticas dos seus projetos, imóveis e leads.</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total de Imóveis</CardTitle><Building className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalProperties}</div><p className="text-xs text-green-600">{stats.availableProperties} disponíveis</p></CardContent></Card>
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total de Leads</CardTitle><Users className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div><p className="text-xs text-gray-600">{stats.activeLeads} em aberto</p></CardContent></Card>
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium text-gray-600">Total de Projetos</CardTitle><FolderOpen className="h-4 w-4 text-blue-600" /></CardHeader><CardContent><div className="text-2xl font-bold text-gray-900">{stats.totalProjects}</div><p className="text-xs text-gray-600">{stats.completed} concluídos</p></CardContent></Card>
        </div>

        {/* Filtros */}
        <Card className="mb-8 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Filter className="w-5 h-5" />Filtros de Projetos</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div><Label htmlFor="status" className="text-xs font-semibold">Status</Label><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger id="status"><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="planning">Planejamento</SelectItem><SelectItem value="in-progress">Em Andamento</SelectItem><SelectItem value="review">Em Revisão</SelectItem><SelectItem value="completed">Concluído</SelectItem></SelectContent></Select></div>
                    <div><Label htmlFor="responsible" className="text-xs font-semibold">Responsável</Label><Select value={responsibleFilter} onValueChange={setResponsibleFilter} disabled><SelectTrigger id="responsible"><SelectValue placeholder="Em breve" /></SelectTrigger></Select></div>
                    <div><Label htmlFor="period" className="text-xs font-semibold">Período</Label><Input id="period" type="date" disabled /></div>
                    <div className="self-end"><Button className="w-full bg-blue-600 hover:bg-blue-700">Aplicar</Button></div>
                </div>
            </CardContent>
        </Card>
      
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Distribuição por Status</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">{statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card>
          <Card className="bg-white shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Distribuição por Prioridade</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={300}><BarChart data={priorityData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#3b82f6" /></BarChart></ResponsiveContainer></CardContent></Card>
        </div>
        <Card className="bg-white shadow-lg"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Progresso dos Projetos</CardTitle></CardHeader><CardContent><ResponsiveContainer width="100%" height={400}><LineChart data={progressData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} /></LineChart></ResponsiveContainer></CardContent></Card>
      </main>
    </div>
  );
};

export default Index;