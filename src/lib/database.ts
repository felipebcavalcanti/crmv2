// src/lib/database.ts
import supabase from './supabase'
import { Project } from '@/pages/Index'

// ===== TYPES =====
import { WeeklyTracking, Checkpoint, ProjectImage } from '@/pages/Index'

// Tipos internos do banco de dados
interface DatabaseWeeklyTracking extends Omit<WeeklyTracking, 'week'> {
  week: string
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
  responsible_id?: string;
}

export interface DatabaseResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// ===== OPERAÇÕES DE PROJETOS =====

export const getProjects = async (): Promise<DatabaseResponse<Project[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Usuário não autenticado', success: false }
    }
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching projects:', error)
      return { data: null, error: error.message, success: false }
    }
    const projects: Project[] = data.map(convertDatabaseToProject)
    return { data: projects, error: null, success: true }
  } catch (error) {
    console.error('Unexpected error fetching projects:', error)
    return { data: null, error: 'Erro inesperado ao buscar projetos', success: false }
  }
}

export const getProject = async (projectId: string): Promise<DatabaseResponse<Project>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Usuário não autenticado', success: false }
    }
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    if (error) {
      console.error('Error fetching project:', error)
      return { data: null, error: error.message, success: false }
    }
    if (!data) {
      return { data: null, error: 'Projeto não encontrado', success: false }
    }
    const project = convertDatabaseToProject(data)
    return { data: project, error: null, success: true }
  } catch (error) {
    console.error('Unexpected error fetching project:', error)
    return { data: null, error: 'Erro inesperado ao buscar projeto', success: false }
  }
}

export const createProject = async (
  projectData: Omit<Project, 'id'>
): Promise<DatabaseResponse<Project>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Usuário não autenticado', success: false }
    }
    const databaseData = convertProjectToDatabase(projectData, user.id)
    const { data, error } = await supabase
      .from('projects')
      .insert(databaseData)
      .select()
      .single()
    if (error) {
      console.error('Error creating project:', error)
      return { data: null, error: error.message, success: false }
    }
    const project = convertDatabaseToProject(data)
    return { data: project, error: null, success: true }
  } catch (error) {
    console.error('Unexpected error creating project:', error)
    return { data: null, error: 'Erro inesperado ao criar projeto', success: false }
  }
}

export const updateProject = async (
  projectId: string,
  updates: Partial<Omit<Project, 'id'>>
): Promise<DatabaseResponse<Project>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Usuário não autenticado', success: false }
    }
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
      return { data: null, error: error.message, success: false }
    }
    if (!data) {
      return { data: null, error: 'Projeto não encontrado ou sem permissão', success: false }
    }
    const project = convertDatabaseToProject(data)
    return { data: project, error: null, success: true }
  } catch (error) {
    console.error('Unexpected error updating project:', error)
    return { data: null, error: 'Erro inesperado ao atualizar projeto', success: false }
  }
}

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
    return { data: true, error: null, success: true }
  } catch (error) {
    console.error('Unexpected error deleting project:', error)
    return { data: null, error: 'Erro inesperado ao deletar projeto', success: false }
  }
}

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
    responsible_id: dbProject.responsible_id,
  }
}

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
    background_image: project.backgroundImage || undefined,
    user_id: userId,
    responsible_id: project.responsible_id,
  }
}

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
  if (updates.responsible_id !== undefined) databaseUpdates.responsible_id = updates.responsible_id
  return databaseUpdates
}

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
    return { data: null, error: 'Erro inesperado ao buscar perfil', success: false }
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
    return { data: null, error: 'Erro inesperado ao atualizar perfil', success: false }
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

// ===== TYPES E OPERAÇÕES DE LEADS =====

export interface Lead {
  id: string;
  user_id: string;
  stage_id: string;
  name: string;
  temperature: 'QUENTE' | 'MORNO' | 'FRIO';
  created_at: string;
  updated_at: string | null;
  email?: string;
  phone?: string;
  outcome: 'Ganho' | 'Perdido' | null;
  status: 'Ativo' | 'Finalizado' | null;
  purpose: 'Venda' | 'Aluguel' | null;
  desired_value: number | null;
  origin: string | null;
  origin_details: string | null;
  notes: string | null;
  last_activity_at: string | null;
  property_of_interest?: string | null;
  next_task?: { title: string; dueDate: string } | null;
  next_contact_date?: string | null;
}

// Busca apenas leads ativos para o Kanban
export const getLeads = async (): Promise<DatabaseResponse<Lead[]>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user.id)
    .is('outcome', null) // Apenas leads ativos
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar leads:', error);
    return { data: null, error: error.message, success: false };
  }
  return { data: data || [], error: null, success: true };
};

// Garante que o lead é criado como 'Ativo'
export const createLead = async (leadData: Partial<Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_activity_at'>>): Promise<DatabaseResponse<Lead>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .from('leads')
        .insert({ ...leadData, user_id: user.id, outcome: null, status: 'Ativo' })
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
    .update({ ...updates, updated_at: new Date().toISOString() })
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

// Utiliza a função RPC para buscar inativos
export const getInactiveLeads = async (filter: 'Ganho' | 'Perdido' | 'all' = 'all'): Promise<DatabaseResponse<Lead[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };
    
    const filterStatus = filter === 'all' ? null : filter;

    const { data, error } = await supabase.rpc('get_inactive_leads', { p_user_id: user.id, filter_status: filterStatus });

    if (error) {
        console.error('Erro ao buscar leads inativos:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data: data || [], error: null, success: true };
};

// Utiliza a função RPC para busca global
export const searchLeads = async (query: string, filter?: 'Ganho' | 'Perdido' | null): Promise<DatabaseResponse<Lead[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase.rpc('search_all_leads', { p_user_id: user.id, search_term: query, filter_status: filter });

    if (error) {
        console.error('Erro ao pesquisar leads:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data: data || [], error: null, success: true };
}

// ===== TYPES E OPERAÇÕES DE HISTÓRICO DE LEADS (IMUTÁVEL) =====

export interface LeadEvent {
    id: string;
    user_id: string;
    lead_id: string;
    event_type: 'Criação' | 'Ganho' | 'Perdido' | 'Reativação' | 'Movimentação' | 'Anotação';
    details: object | null;
    created_at: string;
}

export const createLeadEvent = async (eventData: Omit<LeadEvent, 'id' | 'user_id' | 'created_at'>): Promise<DatabaseResponse<LeadEvent>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase.from('lead_events').insert({ ...eventData, user_id: user.id }).select().single();
    
    if (error) {
        console.error('Erro ao criar evento de lead:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data, error: null, success: true };
};

export const getLeadEvents = async (leadId: string): Promise<DatabaseResponse<LeadEvent[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .from('lead_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar eventos do lead:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data: data || [], error: null, success: true };
}
// ===== TYPES E OPERAÇÕES DE TAREFAS (MISSÃO DIÁRIA) =====

export interface Task {
    id: string;
    user_id: string;
    lead_id: string | null;
    title: string;
    due_date: string;
    priority: 'alta' | 'media' | 'baixa';
    status: 'pendente' | 'concluida';
    type: 'NOVO_LEAD' | 'REGRA_MOTOR' | 'MANUAL';
    created_at: string;
    completed_at: string | null;
    // Campo para JOIN com a tabela de leads
    leads?: { name: string } | null;
}
/**
 * Cria uma nova tarefa manual para o usuário logado
 */
export const createManualTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'status' | 'type' | 'completed_at' | 'leads'>): Promise<DatabaseResponse<Task>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...taskData,
            user_id: user.id,
            type: 'MANUAL', // Define o tipo da tarefa como MANUAL
            status: 'pendente'
        })
        .select()
        .single();

    if (error) {
        console.error('Erro ao criar tarefa manual:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data, error: null, success: true };
};

/**
 * Busca todas as tarefas pendentes para o usuário logado
 */
export const getPendingTasks = async (): Promise<DatabaseResponse<Task[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            leads ( name )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pendente')
        .order('priority', { ascending: true }) // 'alta' vem primeiro
        .order('due_date', { ascending: true });

    if (error) {
        console.error('Erro ao buscar tarefas:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data: data || [], error: null, success: true };
};

/**
 * Atualiza o status de uma tarefa (ex: para 'concluida')
 */
export const updateTaskStatus = async (taskId: string, status: 'pendente' | 'concluida'): Promise<DatabaseResponse<Task>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const updates = {
        status: status,
        completed_at: status === 'concluida' ? new Date().toISOString() : null
    };

    const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data, error: null, success: true };
};
/**
 * Busca as tarefas concluídas mais recentes para o usuário logado
 */
export const getCompletedTasks = async (): Promise<DatabaseResponse<Task[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .from('tasks')
        .select(`
            *,
            leads ( name )
        `)
        .eq('user_id', user.id)
        .eq('status', 'concluida')
        .order('completed_at', { ascending: false }) // Mostra as mais recentes primeiro
        .limit(50); // Limita a 50 para não sobrecarregar a tela

    if (error) {
        console.error('Erro ao buscar tarefas concluídas:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data: data || [], error: null, success: true };
};
// ===== TYPES E OPERAÇÕES DE IMÓVEIS=====
/**
 * Busca um imóvel específico pelo ID usando a função RPC
 */
export const getPropertyById = async (propertyId: string): Promise<DatabaseResponse<Property>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .rpc('get_property_by_id', { p_property_id: propertyId })
        .single();

    if (error) {
        console.error('Erro ao buscar detalhes do imóvel:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data, error: null, success: true };
};

/**
 * Pesquisa imóveis usando a função RPC
 */
export const searchProperties = async (searchTerm: string): Promise<DatabaseResponse<Property[]>> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Usuário não autenticado', success: false };

    const { data, error } = await supabase
        .rpc('search_properties', { search_term: searchTerm });

    if (error) {
        console.error('Erro ao pesquisar imóveis:', error);
        return { data: null, error: error.message, success: false };
    }
    return { data: data || [], error: null, success: true };
};