import { useState, useEffect, useCallback } from 'react'
import { Project } from '@/pages/Index'
import { 
  getProjects, 
  getProject, 
  createProject, 
  updateProject, 
  deleteProject 
} from '@/lib/database'
import { toast } from 'sonner'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Busca todos os projetos
  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    const result = await getProjects()
    
    if (result.success && result.data) {
      setProjects(result.data)
    } else {
      setError(result.error || 'Erro ao buscar projetos')
      toast.error('Erro', {
        description: result.error || 'Erro ao buscar projetos'
      })
    }
    
    setLoading(false)
  }, [])

  // Adiciona um novo projeto
  const addProject = useCallback(async (projectData: Omit<Project, 'id'>) => {
    const result = await createProject(projectData)
    
    if (result.success && result.data) {
      setProjects(prev => [result.data!, ...prev])
      toast.success('Projeto criado com sucesso!')
      return result.data
    } else {
      toast.error('Erro ao criar projeto', {
        description: result.error || 'Erro inesperado'
      })
      throw new Error(result.error || 'Erro ao criar projeto')
    }
  }, [])

  // Atualiza um projeto existente
  const updateProjectData = useCallback(async (projectId: string, updates: Partial<Omit<Project, 'id'>>) => {
    const result = await updateProject(projectId, updates)
    
    if (result.success && result.data) {
      setProjects(prev => 
        prev.map(p => p.id === projectId ? result.data! : p)
      )
      toast.success('Projeto atualizado com sucesso!')
      return result.data
    } else {
      toast.error('Erro ao atualizar projeto', {
        description: result.error || 'Erro inesperado'
      })
      throw new Error(result.error || 'Erro ao atualizar projeto')
    }
  }, [])

  // Remove um projeto
  const removeProject = useCallback(async (projectId: string) => {
    const result = await deleteProject(projectId)
    
    if (result.success) {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success('Projeto excluído com sucesso!')
    } else {
      toast.error('Erro ao excluir projeto', {
        description: result.error || 'Erro inesperado'
      })
      throw new Error(result.error || 'Erro ao excluir projeto')
    }
  }, [])

  // Busca um projeto específico
  const getProjectById = useCallback(async (projectId: string) => {
    const result = await getProject(projectId)
    
    if (result.success && result.data) {
      return result.data
    } else {
      toast.error('Erro ao buscar projeto', {
        description: result.error || 'Projeto não encontrado'
      })
      throw new Error(result.error || 'Projeto não encontrado')
    }
  }, [])

  // Carrega projetos na inicialização
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject: updateProjectData,
    removeProject,
    getProjectById,
  }
}