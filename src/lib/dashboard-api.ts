// Dashboard API - uses frontend API endpoints instead of direct Supabase queries

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
    const response = await fetch('/api/dashboard?table=disputes', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      }
    });
    if (!response.ok) throw new Error('Failed to fetch disputes');
    const result = await response.json();
    return result.data as Dispute[];
  },

  async create(dispute: Omit<Dispute, 'id' | 'created_at' | 'updated_at'>) {
    const response = await fetch('/api/dashboard?table=disputes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': dispute.user_id 
      },
      body: JSON.stringify(dispute)
    });
    if (!response.ok) throw new Error('Failed to create dispute');
    const result = await response.json();
    return result.data as Dispute;
  },

  async update(id: string, updates: Partial<Dispute>) {
    const response = await fetch('/api/dashboard?table=disputes', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': updates.user_id || '' 
      },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update dispute');
    const result = await response.json();
    return result.data as Dispute;
  },

  async delete(id: string, userId: string) {
    const response = await fetch('/api/dashboard?table=disputes', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete dispute');
  }
};

// Certified Mail API
export const certifiedMailApi = {
  async getAll(userId: string) {
    const response = await fetch('/api/dashboard?table=certified_mail', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      }
    });
    if (!response.ok) throw new Error('Failed to fetch certified mail');
    const result = await response.json();
    return result.data as CertifiedMail[];
  },

  async create(mail: Omit<CertifiedMail, 'id' | 'created_at' | 'updated_at'>) {
    const response = await fetch('/api/dashboard?table=certified_mail', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': mail.user_id 
      },
      body: JSON.stringify(mail)
    });
    if (!response.ok) throw new Error('Failed to create mail record');
    const result = await response.json();
    return result.data as CertifiedMail;
  },

  async update(id: string, updates: Partial<CertifiedMail>) {
    const response = await fetch('/api/dashboard?table=certified_mail', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': updates.user_id || '' 
      },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update mail record');
    const result = await response.json();
    return result.data as CertifiedMail;
  },

  async delete(id: string, userId: string) {
    const response = await fetch('/api/dashboard?table=certified_mail', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete mail record');
  }
};

// Complaints API
export const complaintsApi = {
  async getAll(userId: string) {
    const response = await fetch('/api/dashboard?table=complaints', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      }
    });
    if (!response.ok) throw new Error('Failed to fetch complaints');
    const result = await response.json();
    return result.data as Complaint[];
  },

  async create(complaint: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>) {
    const response = await fetch('/api/dashboard?table=complaints', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': complaint.user_id 
      },
      body: JSON.stringify(complaint)
    });
    if (!response.ok) throw new Error('Failed to create complaint');
    const result = await response.json();
    return result.data as Complaint;
  },

  async update(id: string, updates: Partial<Complaint>) {
    const response = await fetch('/api/dashboard?table=complaints', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': updates.user_id || '' 
      },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update complaint');
    const result = await response.json();
    return result.data as Complaint;
  },

  async delete(id: string, userId: string) {
    const response = await fetch('/api/dashboard?table=complaints', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete complaint');
  }
};

// Calendar Events API
export const calendarEventsApi = {
  async getAll(userId: string) {
    const response = await fetch('/api/dashboard?table=calendar_events', {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      }
    });
    if (!response.ok) throw new Error('Failed to fetch calendar events');
    const result = await response.json();
    return result.data as CalendarEvent[];
  },

  async getByDateRange(userId: string, startDate: string, endDate: string) {
    const response = await fetch(`/api/dashboard?table=calendar_events&startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      }
    });
    if (!response.ok) throw new Error('Failed to fetch calendar events');
    const result = await response.json();
    return result.data as CalendarEvent[];
  },

  async create(event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) {
    const response = await fetch('/api/dashboard?table=calendar_events', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': event.user_id 
      },
      body: JSON.stringify(event)
    });
    if (!response.ok) throw new Error('Failed to create calendar event');
    const result = await response.json();
    return result.data as CalendarEvent;
  },

  async update(id: string, updates: Partial<CalendarEvent>) {
    const response = await fetch('/api/dashboard?table=calendar_events', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': updates.user_id || '' 
      },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) throw new Error('Failed to update calendar event');
    const result = await response.json();
    return result.data as CalendarEvent;
  },

  async delete(id: string, userId: string) {
    const response = await fetch('/api/dashboard?table=calendar_events', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'user-id': userId 
      },
      body: JSON.stringify({ id })
    });
    if (!response.ok) throw new Error('Failed to delete calendar event');
  }
};
