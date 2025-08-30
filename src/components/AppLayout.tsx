import { ReactNode, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { Project } from "@/pages/Index";
import { Menu, X } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  projects?: Project[];
}

export const AppLayout = ({ children, projects = [] }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-950">
      {/* Header horizontal no topo */}
      <AppSidebar projects={projects} />

      {/* Conteúdo principal centralizado */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};