import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BarChart3, FolderOpen, Users, Calendar as CalendarIcon2, TrendingUp } from "lucide-react";

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

interface IndexProps {
  projects: Project[];
}

const Index = ({ projects }: IndexProps) => {
  const stats = {
    totalProjects: projects.length,
    inProgress: projects.filter(p => p.status === "in-progress").length,
    completed: projects.filter(p => p.status === "completed").length,
    overdue: projects.filter(p => new Date(p.deliveryDate) < new Date() && p.status !== "completed").length
  };

  // Dados para gráficos
  const statusData = [
    { name: 'Planejamento', value: projects.filter(p => p.status === 'planning').length, color: '#8884d8' },
    { name: 'Em Andamento', value: projects.filter(p => p.status === 'in-progress').length, color: '#82ca9d' },
    { name: 'Em Revisão', value: projects.filter(p => p.status === 'review').length, color: '#ffc658' },
    { name: 'Concluído', value: projects.filter(p => p.status === 'completed').length, color: '#ff7300' }
  ];

  const priorityData = [
    { name: 'Baixa', value: projects.filter(p => p.priority === 'low').length },
    { name: 'Média', value: projects.filter(p => p.priority === 'medium').length },
    { name: 'Alta', value: projects.filter(p => p.priority === 'high').length }
  ];

  const progressData = projects.map(p => ({
    name: p.name.substring(0, 10) + '...',
    progress: p.progress
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Projetos</h1>
              <p className="text-gray-600 mt-1">Visualize o progresso e estatísticas dos seus projetos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Distribuição por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Distribuição por Prioridade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Progresso dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="progress" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;