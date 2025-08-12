// src/components/AppSidebar.tsx
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  Home, 
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface AppSidebarProps {
  projects?: Project[];
}

// Estrutura de dados do menu
const menuItems = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    path: "/dashboard" 
  },
  { 
    id: "projects", 
    label: "Projetos", 
    icon: FolderKanban, // Ícone trocado para melhor representar projetos
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
        { id: "properties-search", label: "Pesquisar Imóvel", path: "/properties/search" },
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
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };
  
  const activeMenu = menuItems.find(item => item.submenus && location.pathname.startsWith(item.path));

  return (
    // CORREÇÃO: h-screen foi trocado para h-full para garantir que o componente se ajuste ao contêiner pai, que já tem h-screen.
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg">
      {/* Cabeçalho do Sidebar */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-blue-600">CRM Imob</h1>
      </div>

      {/* Perfil do Usuário */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-500 text-white">
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {user?.email || 'Usuário'}
            </h3>
            <p className="text-xs text-gray-600">Corretor</p>
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <Accordion type="single" collapsible defaultValue={activeMenu?.id} className="w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.submenus && location.pathname === item.path;
            const isParentActive = item.submenus && location.pathname.startsWith(item.path);

            if (!item.submenus) {
              return (
                <Link to={item.path} key={item.id}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            }

            return (
              <AccordionItem value={item.id} key={item.id} className="border-b-0">
                <AccordionTrigger 
                  className={cn(
                    "py-2 px-3 hover:bg-gray-100 rounded-md text-sm font-medium hover:no-underline",
                    isParentActive && "bg-slate-100 text-blue-600" // Estilo melhorado para o grupo ativo
                  )}
                >
                  <div className="flex items-center">
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-6 pt-1">
                  <div className="space-y-1">
                    {item.submenus.map((submenu) => {
                      const isSubmenuActive = location.pathname === submenu.path;
                      return (
                        <Link to={submenu.path} key={submenu.id}>
                           <Button
                            variant={isSubmenuActive ? "secondary" : "ghost"}
                            className="w-full justify-start h-8 text-sm"
                          >
                            {submenu.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </nav>

      {/* Rodapé com Logout - A classe mt-auto empurra este elemento para o final do contêiner flex */}
      <div className="p-4 border-t mt-auto">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-3" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
};