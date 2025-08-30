qj6UJIMJqVCo7qwL

# CRM iMob - Senha: crm123

## - Apresentação Técnica
<!-- 
🏗️ Arquitetura e Tecnologias

  Stack Tecnológico:
  - Frontend: React 18 + TypeScript + Vite
  - Roteamento: React Router DOM v6
  - Estado Global: TanStack Query (React Query) v5
  - UI: Shadcn/ui + Radix UI + Tailwind CSS
  - Backend: Supabase (PostgreSQL + Auth + Real-time)
  - Notificações: Sonner (toast notifications)
  - Drag & Drop: @hello-pangea/dnd para Kanban
  - Forms: React Hook Form + Zod validation

  🎯 Funcionalidades Principais

  1. Gestão de Leads (CRM Core)
  - Sistema Kanban para pipeline de vendas
  - Classificação por temperatura (QUENTE/MORNO/FRIO)
  - Histórico completo de interações
  - Sistema de arquivamento
  - Busca e filtros avançados

  2. Gestão de Projetos
  - Dashboard com tracking semanal
  - Sistema de checkpoints
  - Upload de imagens
  - Controle de progresso e status
  - Anotações e prioridades

  3. Gestão de Imóveis
  - Cadastro completo de propriedades
  - Sistema de busca
  - Status (Disponível/Vendido/Reservado)
  - Detalhes técnicos e localização

  4. Sistema de Tarefas
  - Tarefas automáticas e manuais
  - Priorização (Alta/Média/Baixa)
  - Vinculação com leads
  - Dashboard de produtividade

  🔐 Sistema de Autenticação

  Implementação Robusta:
  - Supabase Auth com JWT
  - Persistência em cookies seguros
  - Refresh tokens automático
  - Guards de rotas protegidas
  - Recuperação de senha
  - Confirmação de email

  🗃️ Estrutura de Dados

  Entidades Principais:
  - Users (autenticação)
  - Leads (prospects/clientes)
  - Projects (projetos imobiliários)
  - Properties (imóveis)
  - Tasks (tarefas/atividades)
  - KanbanStages (etapas do funil)
  - LeadEvents (histórico)

  📱 Interface e UX

  Design System:
  - Layout responsivo com sidebar colapsível
  - Componentes reutilizáveis (Shadcn/ui)
  - Dark/Light theme support
  - Loading states e error handling
  - Drag & drop para Kanban
  - Modais para ações críticas

  🔄 Hooks Personalizados

  Abstrações Inteligentes:
  - useAuth - Gestão de autenticação
  - useLeads - CRUD completo de leads
  - useProjects - Gestão de projetos
  - useProperties - Gestão de imóveis
  - useTasks - Sistema de tarefas

  🚀 Pontos Fortes da Arquitetura

  1. Modularidade: Separação clara de responsabilidades
  2. Type Safety: TypeScript em toda aplicação
  3. Reatividade: TanStack Query para cache e sincronização
  4. Security: Implementação segura com RLS (Row Level Security)
  5. Performance: Lazy loading e otimizações
  6. Escalabilidade: Estrutura preparada para crescimento

  📊 Fluxo de Negócio

  1. Lead Capture: Novos prospects entram no funil
  2. Kanban Management: Leads movem entre etapas
  3. Property Matching: Associação de imóveis aos leads
  4. Task Management: Acompanhamento de atividades
  5. Project Tracking: Gestão de empreendimentos
  6. Analytics: Dashboard com métricas (em desenvolvimento) -->


  <!-- Tecnologias e Stack

  - Frontend: React 18 + TypeScript + Vite
  - Roteamento: React Router DOM
  - UI Framework: Radix UI + ShadcnUI + Tailwind CSS
  - Estado: React Query (TanStack Query)
  - Backend: Supabase (PostgreSQL + Auth)
  - Validação: Zod
  - Build: Vite com plugins React

  Arquitetura do Sistema

  1. Autenticação
  - Context-based auth com AuthContext.tsx
  - Sistema completo com login, registro, recuperação de senha
  - Proteção de rotas via ProtectedRoute
  - Persistência com cookies usando Supabase

  2. Layout e Navegação
  - Layout responsivo com AppLayout e AppSidebar
  - Navegação por accordion no sidebar
  - Suporte mobile com drawer

  3. Módulos Principais
  - Dashboard (Index.tsx): Visão geral com métricas e tarefas diárias
  - Projetos: Gestão de projetos imobiliários
  - Imóveis: CRUD completo de propriedades
  - Leads/CRM: Funil de vendas com Kanban
  - Marketing: Módulo para campanhas
  - Tarefas: Sistema de missão diária

  4. Hooks Personalizados
  - useAuth: Gerenciamento de autenticação
  - useLeads: Operações de leads e Kanban
  - useProjects: CRUD de projetos
  - useProperties: Gestão de imóveis
  - useTasks: Sistema de tarefas

  5. Camada de Dados
  - database.ts: Abstração completa do Supabase
  - Operações CRUD para todas as entidades
  - Tratamento de erros padronizado
  - Funções RPC para operações complexas

  Estrutura de Pastas

  src/
  ├── components/      # Componentes reutilizáveis e UI
  ├── contexts/        # Contexts (Auth)
  ├── hooks/          # Hooks customizados
  ├── lib/            # Utilitários (database, supabase, utils)
  ├── pages/          # Páginas/rotas da aplicação
  └── utils/          # Tipos e dados auxiliares

  Padrões Implementados

  - Component Pattern: Componentes funcionais com hooks
  - Custom Hooks: Lógica de negócio isolada
  - Context Pattern: Estado global para auth
  - Repository Pattern: Camada de abstração do banco
  - Error Boundary: Tratamento de erros padronizado
  - Responsive Design: Mobile-first com Tailwind

  Recursos Implementados

  - Sistema de autenticação completo
  - Dashboard com métricas em tempo real
  - Kanban para gestão de leads
  - CRUD de imóveis com pesquisa
  - Sistema de tarefas/missões diárias
  - Gestão de projetos
  - Histórico de eventos (audit trail)
  - Layout responsivo -->