import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    set({ user: userData });
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
  checkAuth: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      set({ user: null, loading: false });
      return;
    }
    
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    set({ user: userData, loading: false });
  },
}));