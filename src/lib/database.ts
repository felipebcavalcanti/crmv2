// src/lib/database.ts
import supabase from './supabase'
import { Project } from '@/pages/Index'

// ===== TYPES =====
import { WeeklyTracking, Checkpoint, ProjectImage } from '@/pages/Index'

// Tipos internos do banco de dados
interface DatabaseWeeklyTracking extends Omit<WeeklyTracking, 'week'> {
  week: string // No banco guardamos como string
}

interface DatabaseCheckpoint extends Checkpoint {
  description?: string
}

export interface DatabaseProject {
  id: string
  name: string
  description: string
  allocations: string[]
  delivery_date: string
  status: 'planning' | 'in-progress' | 'review' | 'completed'
  progress: number
  weekly_tracking: DatabaseWeeklyTracking[]
  notes: string
  priority: 'low' | 'medium' | 'high'
  checkpoints?: DatabaseCheckpoint[]
  images?: ProjectImage[]
  background_image?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface DatabaseResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// ===== OPERAÇÕES DE PROJETOS =====

/**
 * Busca todos os projetos do usuário autenticado
 */
export const getProjects = async (): Promise<DatabaseResponse<Project[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado',
        success: false
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return {
        data: null,
        error: error.message,
        success: false
      }
    }

    // Converte os dados do banco para o formato da aplicação
    const projects: Project[] = data.map(convertDatabaseToProject)

    return {
      data: projects,
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Unexpected error fetching projects:', error)
    return {
      data: null,
      error: 'Erro inesperado ao buscar projetos',
      success: false
    }
  }
}

/**
 * Busca um projeto específico por ID
 */
export const getProject = async (projectId: string): Promise<DatabaseResponse<Project>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado',
        success: false
      }
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return {
        data: null,
        error: error.message,
        success: false
      }
    }

    if (!data) {
      return {
        data: null,
        error: 'Projeto não encontrado',
        success: false
      }
    }

    const project = convertDatabaseToProject(data)

    return {
      data: project,
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Unexpected error fetching project:', error)
    return {
      data: null,
      error: 'Erro inesperado ao buscar projeto',
      success: false
    }
  }
}

/**
 * Cria um novo projeto
 */
export const createProject = async (
  projectData: Omit<Project, 'id'>
): Promise<DatabaseResponse<Project>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado',
        success: false
      }
    }

    // Converte os dados da aplicação para o formato do banco
    const databaseData = convertProjectToDatabase(projectData, user.id)

    const { data, error } = await supabase
      .from('projects')
      .insert(databaseData)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return {
        data: null,
        error: error.message,
        success: false
      }
    }

    const project = convertDatabaseToProject(data)

    return {
      data: project,
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Unexpected error creating project:', error)
    return {
      data: null,
      error: 'Erro inesperado ao criar projeto',
      success: false
    }
  }
}

/**
 * Atualiza um projeto existente
 */
export const updateProject = async (
  projectId: string,
  updates: Partial<Omit<Project, 'id'>>
): Promise<DatabaseResponse<Project>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado',
        success: false
      }
    }

    // Converte os dados da aplicação para o formato do banco
    const databaseUpdates = convertProjectUpdatesToDatabase(updates)
    databaseUpdates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('projects')
      .update(databaseUpdates)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return {
        data: null,
        error: error.message,
        success: false
      }
    }

    if (!data) {
      return {
        data: null,
        error: 'Projeto não encontrado ou sem permissão',
        success: false
      }
    }

    const project = convertDatabaseToProject(data)

    return {
      data: project,
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Unexpected error updating project:', error)
    return {
      data: null,
      error: 'Erro inesperado ao atualizar projeto',
      success: false
    }
  }
}

/**
 * Deleta um projeto
 */
export const deleteProject = async (projectId: string): Promise<DatabaseResponse<boolean>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado',
        success: false
      }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting project:', error)
      return {
        data: null,
        error: error.message,
        success: false
      }
    }

    return {
      data: true,
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Unexpected error deleting project:', error)
    return {
      data: null,
      error: 'Erro inesperado ao deletar projeto',
      success: false
    }
  }
}

// ===== FUNÇÕES DE CONVERSÃO =====

/**
 * Converte dados do banco para o formato da aplicação
 */
function convertDatabaseToProject(dbProject: DatabaseProject): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description,
    allocations: dbProject.allocations || [],
    deliveryDate: new Date(dbProject.delivery_date),
    status: dbProject.status,
    progress: dbProject.progress,
    weeklyTracking: dbProject.weekly_tracking || [],
    notes: dbProject.notes,
    priority: dbProject.priority,
    checkpoints: dbProject.checkpoints || [],
    images: dbProject.images || [],
    backgroundImage: dbProject.background_image,
  }
}

/**
 * Converte dados da aplicação para o formato do banco
 */
function convertProjectToDatabase(
  project: Omit<Project, 'id'>, 
  userId: string
): Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'> {
  return {
    name: project.name,
    description: project.description || '',
    allocations: project.allocations || [],
    delivery_date: project.deliveryDate.toISOString(),
    status: project.status,
    progress: project.progress || 0,
    weekly_tracking: project.weeklyTracking || [],
    notes: project.notes || '',
    priority: project.priority,
    checkpoints: project.checkpoints || [],
    images: project.images || [],
    background_image: project.backgroundImage || null,
    user_id: userId,
  }
}

/**
 * Converte atualizações da aplicação para o formato do banco
 */
function convertProjectUpdatesToDatabase(
  updates: Partial<Omit<Project, 'id'>>
): Partial<Omit<DatabaseProject, 'id' | 'user_id' | 'created_at'>> {
  const databaseUpdates: Partial<Omit<DatabaseProject, 'id' | 'user_id' | 'created_at'>> = {}

  if (updates.name !== undefined) databaseUpdates.name = updates.name
  if (updates.description !== undefined) databaseUpdates.description = updates.description
  if (updates.allocations !== undefined) databaseUpdates.allocations = updates.allocations
  if (updates.deliveryDate !== undefined) databaseUpdates.delivery_date = updates.deliveryDate.toISOString()
  if (updates.status !== undefined) databaseUpdates.status = updates.status
  if (updates.progress !== undefined) databaseUpdates.progress = updates.progress
  if (updates.weeklyTracking !== undefined) databaseUpdates.weekly_tracking = updates.weeklyTracking
  if (updates.notes !== undefined) databaseUpdates.notes = updates.notes
  if (updates.priority !== undefined) databaseUpdates.priority = updates.priority
  if (updates.checkpoints !== undefined) databaseUpdates.checkpoints = updates.checkpoints
  if (updates.images !== undefined) databaseUpdates.images = updates.images
  if (updates.backgroundImage !== undefined) databaseUpdates.background_image = updates.backgroundImage

  return databaseUpdates
}

// ===== OPERAÇÕES DE PERFIL DO USUÁRIO =====

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

/**
 * Busca o perfil do usuário
 */
export const getUserProfile = async (): Promise<DatabaseResponse<UserProfile>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado',
        success: false
      }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return {
        data: null,
        error: error.message,
        success: false
      }
    }

    return {
      data: data,
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Unexpected error fetching user profile:', error)
    return {
      data: null,
      error: 'Erro inesperado ao buscar perfil',
      success: false
    }
  }
}

/**
 * Atualiza o perfil do usuário
 */
export const updateUserProfile = async (
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>
): Promise<DatabaseResponse<UserProfile>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        data: null,
        error: 'Usuário não autenticado',
        success: false
      }
    }

    const profileUpdates = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return {
        data: null,
        error: error.message,
        success: false
      }
    }

    return {
      data: data,
      error: null,
      success: true
    }
  } catch (error) {
    console.error('Unexpected error updating user profile:', error)
    return {
      data: null,
      error: 'Erro inesperado ao atualizar perfil',
      success: false
    }
  }
}
/**
 * Busca todos os perfis de usuário da organização
 */
export const getAllProfiles = async (): Promise<DatabaseResponse<UserProfile[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url');

    if (error) {
      console.error('Error fetching all profiles:', error);
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  } catch (error) {
    console.error('Unexpected error fetching all profiles:', error);
    return { data: null, error: 'Erro inesperado ao buscar perfis', success: false };
  }
};
// ===== TYPES PARA IMÓVEIS =====

export interface Property {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  location: string;
  status: 'Disponível' | 'Reservado' | 'Vendido' | 'Indisponível';
  type: 'Casa' | 'Apartamento' | 'Sobrado' | 'Terreno';
  purpose: 'Venda' | 'Aluguel';
  price: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking_spots: number;
  description?: string;
  images?: any; // JSONB para imagens
}

// ===== OPERAÇÕES DE IMÓVEIS =====

/**
 * Busca todos os imóveis do usuário autenticado
 */
export const getProperties = async (): Promise<DatabaseResponse<Property[]>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar imóveis:', error);
    return { data: null, error: error.message, success: false };
  }
  return { data, error: null, success: true };
};

/**
 * Cria um novo imóvel
 */
export const createProperty = async (propertyData: Omit<Property, 'id' | 'user_id' | 'created_at'>): Promise<DatabaseResponse<Property>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

  const { data, error } = await supabase
    .from('properties')
    .insert({ ...propertyData, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar imóvel:', error);
    return { data: null, error: error.message, success: false };
  }
  return { data, error: null, success: true };
};