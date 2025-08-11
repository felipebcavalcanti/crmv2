// src/App.tsx
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
import PropertyNew from "./pages/PropertyNew"; // Importar a página de novo imóvel
import MarketingIntegrations from "./pages/MarketingIntegrations";
import LeadManagement from "./pages/LeadManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { useProjects } from "./hooks/useProjects";

const queryClient = new QueryClient();

// Componente Wrapper para fornecer dados de projetos ao AppLayout
const AppWrapper = () => {
  const { projects } = useProjects();

  return (
    <BrowserRouter>
      <Routes>
        {/* ===== ROTAS PÚBLICAS ===== */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* ===== ROTAS PROTEGIDAS ===== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout projects={projects}>
                <Index />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <AppLayout projects={projects}>
                <Projects />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* ROTAS DE IMÓVEIS CORRIGIDAS E EXPANDIDAS */}
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
          path="/properties/new" 
          element={
            <ProtectedRoute>
              <AppLayout projects={projects}>
                <PropertyNew />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        {/* Adicionando rota de pesquisa como placeholder para evitar erros */}
        <Route 
          path="/properties/search" 
          element={
            <ProtectedRoute>
              <AppLayout projects={projects}>
                <div className="p-8">
                  <h1 className="text-2xl font-bold">Pesquisa de Imóveis</h1>
                  <p className="text-gray-600">Esta funcionalidade está em desenvolvimento.</p>
                </div>
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
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;