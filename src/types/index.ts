export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'support';
  created_at: string;
  full_name?: string;
  department?: string;
  market?: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  category: string;
  asset_id?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  serial_number: string;
  status: 'active' | 'inactive' | 'maintenance';
  assigned_to?: string;
  purchase_date?: string;
  warranty_end?: string;
  market: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author_id: string;
  is_featured: boolean;
  order_index: number;
}