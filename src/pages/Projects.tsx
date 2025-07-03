import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ProjectCard } from "@/components/ProjectCard";
import { AddProjectModal } from "@/components/AddProjectModal";
import { Plus, FolderOpen } from "lucide-react";
import { Project } from "./Index";

interface ProjectsProps {
  projects: Project[];
  onAddProject: (project: Omit<Project, "id">) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const Projects = ({ projects, onAddProject, onUpdateProject, onDeleteProject }: ProjectsProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center py-6 px-8 bg-blue-600 rounded-lg shadow-md mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Projetos</h1>
            <p className="text-blue-200 mt-1">Gerencie todos os seus projetos</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
            <AddProjectModal 
              onAddProject={onAddProject} 
              onClose={() => setIsAddModalOpen(false)}
            />
          </Dialog>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onUpdate={onUpdateProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum projeto</h3>
            <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro projeto.</p>
            <div className="mt-6">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;