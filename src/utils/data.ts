import { Contact, Note, Reminder } from './types';

export const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    phone: '+55 (11) 99123-4567',
    lastContact: new Date('2024-01-10'),
    nextReminder: new Date('2024-01-15'),
    tags: ['amiga', 'designer', 'mentora'],
    notes: [],
    starred: true,
    metAt: 'Conferência de Design 2023',
    relationship: 'Amiga próxima e mentora',
    sentiment: 'positive'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@startup.com',
    lastContact: new Date('2024-01-08'),
    nextReminder: new Date('2024-01-20'),
    tags: ['colega', 'startup', 'precisa-acompanhamento'],
    notes: [],
    starred: false,
    metAt: 'Meetup de tecnologia',
    relationship: 'Contato profissional',
    sentiment: 'neutral'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma.t@agency.com',
    phone: '+55 (11) 98765-4321',
    lastContact: new Date('2024-01-05'),
    nextReminder: new Date('2024-01-18'),
    tags: ['cliente', 'criativa', 'alta-prioridade'],
    notes: [],
    starred: true,
    metAt: 'Indicação de cliente',
    relationship: 'Cliente importante',
    sentiment: 'positive'
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david@techcorp.com',
    lastContact: new Date('2024-01-03'),
    tags: ['ex-colega', 'engenheiro', 'precisa-conversar'],
    notes: [],
    starred: false,
    metAt: 'Empresa anterior',
    relationship: 'Ex-colega',
    sentiment: 'needs-attention'
  }
];

export const mockNotes: Note[] = [
  {
    id: '1',
    contactId: '1',
    content: 'Tivemos um ótimo café conversando sobre seu novo trabalho com design systems. Ela mencionou estar interessada em oportunidades de colaboração.',
    date: new Date('2024-01-10'),
    tags: ['café', 'colaboração', 'design-systems'],
    sentiment: 'positive',
    type: 'meeting'
  },
  {
    id: '2',
    contactId: '2',
    content: 'Ligação rápida sobre o pitch da startup. Ele parecia estressado com o financiamento, mas animado com a direção do produto.',
    date: new Date('2024-01-08'),
    tags: ['startup', 'financiamento', 'produto'],
    sentiment: 'neutral',
    type: 'call'
  }
];

export const mockReminders: Reminder[] = [
  {
    id: '1',
    contactId: '1',
    contactName: 'Sarah Chen',
    message: 'Acompanhar projeto de colaboração',
    date: new Date('2024-01-15'),
    completed: false
  },
  {
    id: '2',
    contactId: '3',
    contactName: 'Emma Thompson',
    message: 'Enviar rascunho da proposta do projeto',
    date: new Date('2024-01-18'),
    completed: false
  },
  {
    id: '3',
    contactId: '4',
    contactName: 'David Park',
    message: 'Agendar conversa para colocar o papo em dia',
    date: new Date('2024-01-16'),
    completed: false
  }
];