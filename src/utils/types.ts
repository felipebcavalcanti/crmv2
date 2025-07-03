export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  lastContact?: Date;
  nextReminder?: Date;
  tags: string[];
  notes: Note[];
  starred: boolean;
  metAt?: string;
  relationship: string;
  sentiment: 'positive' | 'neutral' | 'needs-attention';
}

export interface Note {
  id: string;
  contactId: string;
  content: string;
  date: Date;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'needs-attention';
  type: 'note' | 'call' | 'meeting' | 'email';
}

export interface Reminder {
  id: string;
  contactId: string;
  contactName: string;
  message: string;
  date: Date;
  completed: boolean;
}