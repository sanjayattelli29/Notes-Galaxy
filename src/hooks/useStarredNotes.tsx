
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Note } from "@/lib/api/types";

export const useStarredNotes = () => {
  const queryClient = useQueryClient();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['starred-notes'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_starred', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching starred notes:', error);
        toast.error('Failed to fetch starred notes');
        throw error;
      }

      return data as Note[] || [];
    },
  });

  const handleStar = async (id: string, isStarred: boolean) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['starred-notes'], (oldData: Note[] = []) => {
        return oldData.filter(note => note.id !== id);
      });

      const { error } = await supabase
        .from('notes')
        .update({ is_starred: false })
        .eq('id', id);

      if (error) throw error;
      
      // Invalidate notes queries
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    } catch (error) {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['starred-notes'] });
      console.error('Error updating note:', error);
      toast.error("Failed to update note");
    }
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    try {
      if (!isPinned) {
        const pinnedNotes = (notes as Note[]).filter(note => note.is_pinned);
        if (pinnedNotes.length >= 5) {
          toast.error("You can pin a maximum of 5 notes");
          return;
        }
      }

      // Optimistic update
      queryClient.setQueryData(['starred-notes'], (oldData: Note[] = []) => {
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
      queryClient.invalidateQueries({ queryKey: ['starred-notes'] });
      console.error('Error updating note:', error);
      toast.error("Failed to update note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      queryClient.setQueryData(['starred-notes'], (oldData: Note[] = []) => {
        return oldData.filter(note => note.id !== id);
      });

      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success("Note moved to trash");
    } catch (error) {
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['starred-notes'] });
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
