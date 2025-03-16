
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Note } from "@/lib/api/types";

export const useNotes = (selectedCategory: string | null | undefined) => {
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['notes', { category: selectedCategory }],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notes:', error);
        toast.error('Failed to fetch notes');
        throw error;
      }

      return data as Note[] || [];
    },
  });

  const handleStar = async (id: string, isStarred: boolean) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['notes', { category: selectedCategory }], (oldData: Note[] = []) => {
        return oldData.map(note => 
          note.id === id ? { ...note, is_starred: !isStarred } : note
        );
      });

      const { error } = await supabase
        .from('notes')
        .update({ is_starred: !isStarred })
        .eq('id', id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['starred-notes'] });
    } catch (error) {
      // Revert optimistic update
      queryClient.setQueryData(['notes', { category: selectedCategory }], (oldData: Note[] = []) => {
        return oldData.map(note => 
          note.id === id ? { ...note, is_starred: isStarred } : note
        );
      });
      console.error('Error updating note:', error);
      toast.error("Failed to update note");
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      // Check if we're trying to pin a note and we already have 5 pinned notes
      if (!isPinned) {
        const pinnedNotes = (notes as Note[]).filter(note => note.is_pinned);
        if (pinnedNotes.length >= 5) {
          toast.error("You can pin a maximum of 5 notes");
          return;
        }
      }

      // Optimistic update
      queryClient.setQueryData(['notes', { category: selectedCategory }], (oldData: Note[] = []) => {
        return oldData.map(note => 
          note.id === id ? { ...note, is_pinned: !isPinned } : note
        );
      });

      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !isPinned })
        .eq('id', id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    } catch (error) {
      // Revert optimistic update
      queryClient.setQueryData(['notes', { category: selectedCategory }], (oldData: Note[] = []) => {
        return oldData.map(note => 
          note.id === id ? { ...note, is_pinned: isPinned } : note
        );
      });
      console.error('Error updating note pin status:', error);
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['notes', { category: selectedCategory }], (oldData: Note[] = []) => {
        return oldData.filter(note => note.id !== id);
      });

      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['notes', 'starred-notes'] });
      toast.success("Note moved to trash");
    } catch (error) {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['notes', { category: selectedCategory }] });
      console.error('Error deleting note:', error);
      toast.error("Failed to delete note");
    }
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setIsOpen(true);
  };

  // Group notes by pinned status
  const pinnedNotes = (notes as Note[]).filter(note => note.is_pinned);
  const regularNotes = (notes as Note[]).filter(note => !note.is_pinned);

  return {
    notes,
    isLoading,
    pinnedNotes,
    regularNotes,
    editingNote,
    setEditingNote,
    isOpen,
    setIsOpen,
    handleStar,
    handlePin,
    handleDelete,
    handleOpenEdit,
  };
};
