import { useNavigate, useLocation } from "react-router-dom";
import { 
  Home, 
  TrendingUp,
  LogOut,
  User,
  Building,
  Users
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/pages/Index";

interface AppSidebarProps {
  projects?: Project[];
}

export const AppSidebar = ({ projects = [] }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "projects", label: "Projetos", icon: TrendingUp, path: "/projects" },
    { id: "properties", label: "Gestão de Imóveis", icon: Building, path: "/properties" },
    { id: "marketing", label: "Marketing e Integrações", icon: TrendingUp, path: "/marketing" },
    { id: "leads", label: "CRM - Gestão de Leads", icon: Users, path: "/leads" },
  ];

  const handleItemClick = (item) => {
    navigate(item.path);
    console.log(`Navegando para: ${item.path}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("Logout realizado");
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  // Estatísticas dinâmicas baseadas nos projetos
  const stats = {
    active: projects.filter(p => p.status === "in-progress").length,
    completed: projects.filter(p => p.status === "completed").length,
    overdue: projects.filter(p => new Date(p.deliveryDate) < new Date() && p.status !== "completed").length
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Menu</h2>
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                {user?.email || 'Usuário Demo'}
              </h3>
              <p className="text-xs text-gray-600">Gerente de Projetos</p>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Online
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-200 mx-4" />

      <div className="flex-1 p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Navegação</h3>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive 
                    ? 'bg-blue-100 text-blue-900 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {projects.length > 0 && (
          <>
            <div className="h-px bg-gray-200 my-4" />
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Estatísticas Rápidas</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Projetos Ativos</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{stats.active}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Concluídos</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">{stats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Em Atraso</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">{stats.overdue}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
};