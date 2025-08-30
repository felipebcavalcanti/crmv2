// src/components/AppSidebar.tsx
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard,
  Building2,
  Users,
  Megaphone,
  LogOut,
  User,
  FolderKanban // Ícone atualizado para Projetos
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/pages/Index";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface AppSidebarProps {
  projects?: Project[];
}

const menuItems = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    path: "/dashboard",
    isSingle: true // Flag para itens de menu que não têm submenus
  },
  { 
    id: "projects", 
    label: "Projetos", 
    icon: FolderKanban, 
    path: "/projects",
    submenus: [
        { id: "projects-overview", label: "Visão Geral", path: "/projects" },
    ]
  },
  { 
    id: "properties", 
    label: "Imóveis", 
    icon: Building2, 
    path: "/properties",
    submenus: [
        { id: "properties-list", label: "Listar Imóveis", path: "/properties" },
        { id: "properties-new", label: "Cadastrar Imóvel", path: "/properties/new" },
        
    ]
  },
  { 
    id: "leads", 
    label: "Leads (CRM)", 
    icon: Users, 
    path: "/leads",
    submenus: [
        { id: "leads-funnel", label: "Funil de Vendas", path: "/leads" },
    ]
  },
  { 
    id: "marketing", 
    label: "Marketing", 
    icon: Megaphone, 
    path: "/marketing",
    submenus: [
        { id: "marketing-campaigns", label: "Campanhas", path: "/marketing" },
    ]
  },
];

export const AppSidebar = ({ projects = [] }: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/'); 
  };
  

  return (
    <div className="w-full h-16 bg-slate-900 border-b border-slate-800 flex items-center shadow-lg">
      <div className="px-6">
        <Link to="/dashboard">
          <h1 className="text-xl font-bold text-white">CRM Imob</h1>
        </Link>
      </div>

      <nav className="flex-1 flex items-center justify-center">
        <div className="flex items-center space-x-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const isParentActive = item.submenus && location.pathname.startsWith(item.path);

            if (item.isSingle) {
              return (
                <Link to={item.path} key={item.id}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-slate-300 hover:text-white hover:bg-slate-800",
                      isActive && "bg-slate-800 text-white"
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            }

            return (
              <div key={item.id} className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    "text-slate-300 hover:text-white hover:bg-slate-800",
                    isParentActive && "bg-slate-800 text-white"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
                <div className="absolute top-full left-0 mt-1 bg-slate-900 border border-slate-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[180px]">
                  {item.submenus?.map((submenu) => {
                    const isSubmenuActive = location.pathname === submenu.path;
                    return (
                      <Link to={submenu.path} key={submenu.id}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 rounded-none",
                            isSubmenuActive && "bg-slate-800 text-white"
                          )}
                        >
                          {submenu.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      <div className="px-6 flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-slate-700 text-white">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">
              {user?.email || 'Usuário'}
            </p>
            <p className="text-xs text-slate-400">Corretor</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="text-slate-300 hover:text-red-400 hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};