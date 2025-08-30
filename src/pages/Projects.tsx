// src/pages/Projects.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ProjectCard } from "@/components/ProjectCard";
import { AddProjectModal } from "@/components/AddProjectModal";
import { Plus, FolderOpen, Loader2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "./Index"; // A interface Project continua aqui por enquanto

const Projects = () => {
  // O componente agora gerencia seu próprio estado de dados e modais.
  const { projects, addProject, updateProject, removeProject, loading, error } = useProjects();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddProject = async (newProject: Omit<Project, "id">) => {
    try {
      await addProject(newProject);
      setIsAddModalOpen(false); // Fecha o modal apenas em caso de sucesso
    } catch (e) {
      // O erro já é tratado e exibido via toast pelo hook, então não precisamos fazer nada aqui.
      console.error("Falha ao adicionar projeto:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background dark">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-4 text-lg text-foreground">Carregando projetos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-destructive dark">
        <p>Erro ao carregar os projetos: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Projetos</h1>
            <p className="text-muted-foreground mt-1">Gerencie, adicione e visualize todos os seus projetos.</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
            {/* O modal agora recebe a função de adicionar e a de fechar */}
            <AddProjectModal 
              onAddProject={handleAddProject} 
              onClose={() => setIsAddModalOpen(false)}
            />
          </Dialog>
        </div>

        {/* Grade de Projetos */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={updateProject}
                onDelete={removeProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-card/30">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">Nenhum projeto encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">Comece criando seu primeiro projeto.</p>
            <div className="mt-6">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Projeto
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;