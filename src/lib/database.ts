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
  updated_at: string | null;
  responsible_id?: string | null;
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
    const projects: Project[] = data.map(dbProject => ({
        ...dbProject,
        deliveryDate: new Date(dbProject.delivery_date)
    }));

    return {
      data: projects,
      error: null,
      success: true
    }
  } catch (error: any) {
    console.error('Unexpected error fetching projects:', error)
    return {
      data: null,
      error: error.message || 'Erro inesperado ao buscar projetos',
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
    
    const project = { ...data, deliveryDate: new Date(data.delivery_date) };

    return {
      data: project,
      error: null,
      success: true
    }
  } catch (error: any) {
    console.error('Unexpected error fetching project:', error)
    return {
      data: null,
      error: error.message || 'Erro inesperado ao buscar projeto',
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
    
    const databaseData = {
        ...projectData,
        user_id: user.id,
        delivery_date: projectData.deliveryDate.toISOString()
    };
    delete (databaseData as any).deliveryDate;

    const { data, error } = await supabase
      .from('projects')
      .insert(databaseData)
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      return { data: null, error: error.message, success: false }
    }

    const project = { ...data, deliveryDate: new Date(data.delivery_date) };

    return {
      data: project,
      error: null,
      success: true
    }
  } catch (error: any) {
    console.error('Unexpected error creating project:', error)
    return {
      data: null,
      error: error.message || 'Erro inesperado ao criar projeto',
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

    const databaseUpdates: any = { ...updates };
    if (updates.deliveryDate) {
        databaseUpdates.delivery_date = updates.deliveryDate.toISOString();
        delete databaseUpdates.deliveryDate;
    }

    const { data, error } = await supabase
      .from('projects')
      .update(databaseUpdates)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      return { data: null, error: error.message, success: false }
    }

    if (!data) {
      return { data: null, error: 'Projeto não encontrado ou sem permissão', success: false }
    }

    const project = { ...data, deliveryDate: new Date(data.delivery_date) };

    return {
      data: project,
      error: null,
      success: true
    }
  } catch (error: any) {
    console.error('Unexpected error updating project:', error)
    return {
      data: null,
      error: error.message || 'Erro inesperado ao atualizar projeto',
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
      return { data: null, error: 'Usuário não autenticado', success: false }
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting project:', error)
      return { data: null, error: error.message, success: false }
    }

    return {
      data: true,
      error: null,
      success: true
    }
  } catch (error: any) {
    console.error('Unexpected error deleting project:', error)
    return { data: null, error: error.message || 'Erro inesperado ao deletar projeto', success: false }
  }
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

export const getUserProfile = async (): Promise<DatabaseResponse<UserProfile>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'Usuário não autenticado', success: false }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return { data: null, error: error.message, success: false }
    }

    return { data: data, error: null, success: true }
  } catch (error: any) {
    console.error('Unexpected error fetching user profile:', error)
    return { data: null, error: error.message || 'Erro inesperado ao buscar perfil', success: false }
  }
}

export const updateUserProfile = async (
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>
): Promise<DatabaseResponse<UserProfile>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'Usuário não autenticado', success: false }
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
      return { data: null, error: error.message, success: false }
    }

    return { data: data, error: null, success: true }
  } catch (error: any) {
    console.error('Unexpected error updating user profile:', error)
    return { data: null, error: error.message || 'Erro inesperado ao atualizar perfil', success: false }
  }
}

export const getAllProfiles = async (): Promise<DatabaseResponse<UserProfile[]>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url');

    if (error) {
      console.error('Error fetching all profiles:', error);
      return { data: null, error: error.message, success: false };
    }

    return { data: data || [], error: null, success: true };
  } catch (error: any) {
    console.error('Unexpected error fetching all profiles:', error);
    return { data: null, error: error.message || 'Erro inesperado ao buscar perfis', success: false };
  }
};

// ===== TYPES E OPERAÇÕES DE IMÓVEIS =====
export interface Property {
    id: string;
    user_id: string;
    created_at: string;
    updated_at?: string | null;
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
    images?: any;
}
  
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
    return { data: data || [], error: null, success: true };
};
  
export const createProperty = async (propertyData: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DatabaseResponse<Property>> => {
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

// ===== OPERAÇÕES DE KANBAN =====

export interface KanbanStage {
    id: string;
    user_id: string;
    name: string;
    position: number;
    created_at: string;
}

export const getKanbanStages = async (): Promise<DatabaseResponse<KanbanStage[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .from('kanban_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });

    if (error) {
        console.error('Erro ao buscar etapas do Kanban:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data: data || [], error: null, success: true };
};

export const createDefaultKanbanStages = async (): Promise<DatabaseResponse<KanbanStage[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const defaultStages = [
        { user_id: user.id, name: 'Captura', position: 0 },
        { user_id: user.id, name: 'Qualificação', position: 1 },
        { user_id: user.id, name: 'Visita Agendada', position: 2 },
        { user_id: user.id, name: 'Negociação', position: 3 }
    ];

    const { data, error } = await supabase.from('kanban_stages').insert(defaultStages).select();

    if (error) {
        console.error('Erro ao criar etapas padrão do Kanban:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data, error: null, success: true };
};

// ===== TYPES E OPERAÇÕES DE LEADS (ESTRUTURA INTELIGENTE) =====

export interface Lead {
  id: string;
  user_id: string;
  stage_id: string;
  name: string;
  temperature: 'QUENTE' | 'MORNO' | 'FRIO';
  property_of_interest: string | null;
  next_task: { title: string; dueDate: string } | null;
  created_at: string;
  updated_at: string | null;
  email?: string;
  phone?: string;
  next_contact_date?: string | null;
}

export const getLeads = async (): Promise<DatabaseResponse<Lead[]>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar leads:', error);
    return { data: null, error: error.message, success: false };
  }
  return { data: data || [], error: null, success: true };
};

export const createLead = async (leadData: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<DatabaseResponse<Lead>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

  const { data, error } = await supabase
    .from('leads')
    .insert({ ...leadData, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar lead:', error);
    return { data: null, error: error.message, success: false };
  }
  return { data, error: null, success: true };
};

export const updateLead = async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at'>>): Promise<DatabaseResponse<Lead>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', leadId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar lead:', error);
    return { data: null, error: error.message, success: false };
  }
  return { data, error: null, success: true };
};