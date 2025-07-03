import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Project } from "@/pages/Index";
import { Menu, X } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  projects?: Project[];
}

export const AppLayout = ({ children, projects = [] }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden lg:block shrink-0">
        <AppSidebar projects={projects} />
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div className={`lg:hidden fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <AppSidebar projects={projects} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header com trigger da sidebar para mobile */}
        <header className="h-12 sm:h-14 flex items-center border-b bg-white px-4 lg:hidden shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">Dashboard</h1>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};