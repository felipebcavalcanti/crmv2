import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import PropertyManagement from "./pages/PropertyManagement";
import MarketingIntegrations from "./pages/MarketingIntegrations";
import LeadManagement from "./pages/LeadManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useState } from "react";
import { Project } from "./pages/Index";

const queryClient = new QueryClient();

const App = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Sistema de E-commerce",
      description: "Desenvolvimento de plataforma completa de e-commerce com pagamento integrado",
      allocations: ["João Silva", "Maria Santos", "Pedro Costa"],
      deliveryDate: new Date("2024-08-15"),
      status: "in-progress",
      progress: 65,
      weeklyTracking: [
        {
          week: "Semana 1",
          progress: 25,
          notes: "Setup inicial e configuração do ambiente",
          blockers: []
        },
        {
          week: "Semana 2",
          progress: 45,
          notes: "Desenvolvimento da API de produtos",
          blockers: ["Aguardando aprovação do design"]
        },
        {
          week: "Semana 3",
          progress: 65,
          notes: "Implementação do carrinho de compras",
          blockers: []
        }
      ],
      notes: "Projeto prioritário para Q3. Cliente demonstrou alta satisfação com o progresso atual.",
      priority: "high",
      checkpoints: [
        { id: "1", title: "Setup inicial", completed: true },
        { id: "2", title: "API de produtos", completed: true },
        { id: "3", title: "Carrinho de compras", completed: true },
        { id: "4", title: "Sistema de pagamento", completed: false },
        { id: "5", title: "Testes finais", completed: false }
      ]
    },
    {
      id: "2",
      name: "App Mobile Delivery",
      description: "Aplicativo móvel para delivery de comida com rastreamento em tempo real",
      allocations: ["Ana Oliveira", "Carlos Mendes"],
      deliveryDate: new Date("2024-09-30"),
      status: "planning",
      progress: 15,
      weeklyTracking: [
        {
          week: "Semana 1",
          progress: 15,
          notes: "Levantamento de requisitos e wireframes",
          blockers: ["Definição final do escopo"]
        }
      ],
      notes: "Aguardando definição final dos requisitos pelo cliente.",
      priority: "medium",
      checkpoints: [
        { id: "1", title: "Levantamento de requisitos", completed: true },
        { id: "2", title: "Wireframes", completed: false },
        { id: "3", title: "Desenvolvimento", completed: false },
        { id: "4", title: "Testes", completed: false }
      ]
    }
  ]);

  const handleAddProject = (newProject: Omit<Project, "id">) => {
    const project: Project = {
      ...newProject,
      id: Date.now().toString()
    };
    setProjects(prevProjects => [...prevProjects, project]);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <AppLayout projects={projects}>
                      <Index projects={projects} />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/projects" 
                element={
                  <ProtectedRoute>
                    <AppLayout projects={projects}>
                      <Projects 
                        projects={projects}
                        onAddProject={handleAddProject}
                        onUpdateProject={handleUpdateProject}
                        onDeleteProject={handleDeleteProject}
                      />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/properties" 
                element={
                  <ProtectedRoute>
                    <AppLayout projects={projects}>
                      <PropertyManagement />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/marketing" 
                element={
                  <ProtectedRoute>
                    <AppLayout projects={projects}>
                      <MarketingIntegrations />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leads" 
                element={
                  <ProtectedRoute>
                    <AppLayout projects={projects}>
                      <LeadManagement />
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;