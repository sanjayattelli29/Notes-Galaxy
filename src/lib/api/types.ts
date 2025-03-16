
export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  is_starred: boolean;
  is_pinned: boolean;
  link?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user_id?: string;
}

// Define the database schema for type safety with Supabase
export type Database = {
  public: {
    Tables: {
      notes: {
        Row: Note;
        Insert: Omit<Note, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Note, 'id'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id'>>;
      };
    };
  };
};
