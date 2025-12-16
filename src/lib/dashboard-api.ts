import { supabase } from './supabase';

// Dispute Types
export interface Dispute {
  id: string;
  user_id: string;
  title: string;
  bureau: string;
  description?: string;
  status: 'pending' | 'sent' | 'resolved' | 'escalated';
  date_sent?: string;
  date_received?: string;
  tracking_number?: string;
  response_deadline?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CertifiedMail {
  id: string;
  user_id: string;
  tracking_number: string;
  recipient: string;
  description?: string;
  date_mailed: string;
  date_delivered?: string;
  status: 'mailed' | 'in_transit' | 'delivered' | 'returned';
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface Complaint {
  id: string;
  user_id: string;
  agency: string;
  complaint_number?: string;
  description?: string;
  date_filed: string;
  status: 'filed' | 'under_review' | 'resolved' | 'closed';
  response_received: boolean;
  response_date?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  event_type: 'deadline' | 'mailed' | 'delivered' | 'reminder' | 'response';
  related_id?: string;
  related_type?: string;
  is_completed: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Disputes API
export const disputesApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Dispute[];
  },

  async create(dispute: Omit<Dispute, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('disputes')
      .insert(dispute)
      .select()
      .single();
    
    if (error) throw error;
    return data as Dispute;
  },

  async update(id: string, updates: Partial<Dispute>) {
    const { data, error } = await supabase
      .from('disputes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Dispute;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('disputes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Certified Mail API
export const certifiedMailApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('certified_mail')
      .select('*')
      .eq('user_id', userId)
      .order('date_mailed', { ascending: false });
    
    if (error) throw error;
    return data as CertifiedMail[];
  },

  async create(mail: Omit<CertifiedMail, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('certified_mail')
      .insert(mail)
      .select()
      .single();
    
    if (error) throw error;
    return data as CertifiedMail;
  },

  async update(id: string, updates: Partial<CertifiedMail>) {
    const { data, error } = await supabase
      .from('certified_mail')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CertifiedMail;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('certified_mail')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Complaints API
export const complaintsApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', userId)
      .order('date_filed', { ascending: false });
    
    if (error) throw error;
    return data as Complaint[];
  },

  async create(complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('complaints')
      .insert(complaint)
      .select()
      .single();
    
    if (error) throw error;
    return data as Complaint;
  },

  async update(id: string, updates: Partial<Complaint>) {
    const { data, error } = await supabase
      .from('complaints')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Complaint;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('complaints')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Calendar Events API
export const calendarEventsApi = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .order('event_date', { ascending: true });
    
    if (error) throw error;
    return data as CalendarEvent[];
  },

  async getByDateRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .gte('event_date', startDate)
      .lte('event_date', endDate)
      .order('event_date', { ascending: true });
    
    if (error) throw error;
    return data as CalendarEvent[];
  },

  async create(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert(event)
      .select()
      .single();
    
    if (error) throw error;
    return data as CalendarEvent;
  },

  async update(id: string, updates: Partial<CalendarEvent>) {
    const { data, error } = await supabase
      .from('calendar_events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CalendarEvent;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
