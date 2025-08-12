// src/App.tsx
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import PropertyManagement from "./pages/PropertyManagement";
import PropertyNew from "./pages/PropertyNew";
import PropertyDetails from "./pages/PropertyDetails"; // Importado
import MarketingIntegrations from "./pages/MarketingIntegrations";
import LeadManagement from "./pages/LeadManagement";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

const queryClient = new QueryClient();

const AppWrapper = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===== ROTAS PÚBLICAS ===== */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* ===== ROTAS PROTEGIDAS ===== */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><AppLayout><Projects /></AppLayout></ProtectedRoute>} />
        
        {/* ROTAS DE IMÓVEIS ATUALIZADAS */}
        <Route path="/properties" element={<ProtectedRoute><AppLayout><PropertyManagement /></AppLayout></ProtectedRoute>} />
        <Route path="/properties/new" element={<ProtectedRoute><AppLayout><PropertyNew /></AppLayout></ProtectedRoute>} />
        {/* ROTA DE DETALHES CORRIGIDA */}
        <Route path="/properties/:id" element={<ProtectedRoute><AppLayout><PropertyDetails /></AppLayout></ProtectedRoute>} />

        <Route path="/marketing" element={<ProtectedRoute><AppLayout><MarketingIntegrations /></AppLayout></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><AppLayout><LeadManagement /></AppLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;