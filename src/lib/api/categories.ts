
import { supabase } from "@/integrations/supabase/client";
import type { Category } from "./types";

export const fetchCategories = async (): Promise<Category[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', session.user.id)
    .order('name');

  if (error) throw error;
  return data || [];
};

export const createCategory = async (name: string, color: string): Promise<Category> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .insert([{ 
      name, 
      color,
      user_id: session.user.id 
    }])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('No data returned from insert');
  return data;
};

export const updateCategory = async (id: string, updates: { name?: string; color?: string }): Promise<Category> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', session.user.id) // Make sure user can only update their own categories
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('No data returned from update');
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id); // Make sure user can only delete their own categories

  if (error) throw error;
};
