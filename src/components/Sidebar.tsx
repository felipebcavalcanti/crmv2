import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Home,
    Settings,
    TrendingUp,
    LogOut,
    X,
    User,
    Building,
    Users
} from "lucide-react";
import { Project } from "@/pages/Index";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    projects: Project[];
}

export const Sidebar = ({ isOpen, onClose, projects }: SidebarProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activeItem, setActiveItem] = useState("dashboard");
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth();

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
        { id: "projects", label: "Projetos", icon: TrendingUp, path: "/projects" },
        { id: "properties", label: "Gestão de Imóveis", icon: Building, path: "/properties" },
        { id: "marketing", label: "Marketing e Integrações", icon: TrendingUp, path: "/marketing" },
        { id: "leads", label: "CRM - Gestão de Leads", icon: Users, path: "/leads" },
        { id: "settings", label: "Configurações", icon: Settings, path: "/settings" },
    ];

    const handleItemClick = (item) => {
        setActiveItem(item.id);
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
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div
                className={`
          fixed lg:relative top-0 left-0 h-full w-64 bg-white shadow-xl z-50 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:block
        `}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="lg:hidden"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="p-4 border-b">
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-3">
                                    <Avatar>
                                        <AvatarImage src="/api/placeholder/40/40" />
                                        <AvatarFallback className="bg-blue-500 text-white">
                                            <User className="w-4 h-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {user?.email || 'Usuário Demo'}
                                        </h3>
                                        <p className="text-xs text-gray-600">Gerente de Projetos</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        Online
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <nav className="flex-1 p-4">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <li key={item.id}>
                                        <Button
                                            variant={isActive ? "default" : "ghost"}
                                            className={`
                        w-full justify-start h-10 
                        ${isActive
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                }
                      `}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <Icon className="w-4 h-4 mr-3" />
                                            {item.label}
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="p-4 border-t">
                        <Card className="bg-gray-50">
                            <CardHeader className="p-3">
                                <CardTitle className="text-sm">Estatísticas Rápidas</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Projetos Ativos</span>
                                        <Badge variant="outline" className="text-xs">{stats.active}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Concluídos</span>
                                        <Badge variant="outline" className="text-xs">{stats.completed}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Em Atraso</span>
                                        <Badge variant="destructive" className="text-xs">{stats.overdue}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="p-4 border-t">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4 mr-3" />
                            Sair
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};