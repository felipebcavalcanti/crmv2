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
import MarketingIntegrations from "./pages/MarketingIntegrations";
import LeadManagement from "./pages/LeadManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import { useProjects } from "./hooks/useProjects";

const queryClient = new QueryClient();

// Componente Wrapper para fornecer dados de projetos ao AppLayout
const AppWrapper = () => {
  const { projects } = useProjects(); // Hook é chamado aqui

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
              {/* AppLayout recebe os projetos para o sidebar */}
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
    </QueryClientProvider> // CORREÇÃO APLICADA AQUI
  );
};

export default App;