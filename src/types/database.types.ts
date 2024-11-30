export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'user' | 'support'
          created_at: string
          full_name: string | null
          department: string | null
          market: string | null
          status: 'active' | 'pending' | 'inactive'
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'user' | 'support'
          created_at?: string
          full_name?: string | null
          department?: string | null
          market?: string | null
          status?: 'active' | 'pending' | 'inactive'
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'user' | 'support'
          created_at?: string
          full_name?: string | null
          department?: string | null
          market?: string | null
          status?: 'active' | 'pending' | 'inactive'
        }
      }
      help_articles: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          is_featured: boolean
          created_at: string
          order_index: number
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          is_featured?: boolean
          created_at?: string
          order_index?: number
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          is_featured?: boolean
          created_at?: string
          order_index?: number
        }
      }
    }
  }
}