
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Note } from "@/lib/api/types";
import { deleteImageFromStorage } from "@/lib/api/storage";

export const useTrashNotes = () => {
  const queryClient = useQueryClient();

  const { data: trashedNotes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['trashedNotes'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return [];
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', session.user.id)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data as Note[] || [];
    },
  });

  const handleRestore = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      // Optimistic update
      queryClient.setQueryData(['trashedNotes'], (oldData: Note[] = []) => {
        return oldData.filter(note => note.id !== id);
      });

      const { error } = await supabase
        .from('notes')
        .update({ deleted_at: null })
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['trashedNotes'] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success("Note restored successfully");
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['trashedNotes'] });
      toast.error("Failed to restore note");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      // Optimistic update
      queryClient.setQueryData(['trashedNotes'], (oldData: Note[] = []) => {
        return oldData.filter(note => note.id !== id);
      });

      const { data: noteToDelete, error: fetchError } = await supabase
        .from('notes')
        .select('image_url')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();

      if (fetchError) throw fetchError;

      // Delete the note from the database
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      // Delete associated images from storage
      if (noteToDelete && noteToDelete.image_url) {
        await deleteImageFromStorage(noteToDelete.image_url);
      }

      queryClient.invalidateQueries({ queryKey: ['trashedNotes'] });
      toast.success("Note permanently deleted");
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['trashedNotes'] });
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    }
  };

  const handleDeleteAll = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in");
        return;
      }

      // Fetch all trashed notes with their image URLs before deleting them
      const { data: notesToDelete, error: fetchError } = await supabase
        .from('notes')
        .select('id, image_url')
        .eq('user_id', session.user.id)
        .not('deleted_at', 'is', null);

      if (fetchError) throw fetchError;

      if (!notesToDelete || notesToDelete.length === 0) {
        toast.info("No notes to delete");
        return;
      }

      // Optimistic UI update
      queryClient.setQueryData(['trashedNotes'], []);

      // Delete all trashed notes from the database
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', session.user.id)
        .not('deleted_at', 'is', null);

      if (deleteError) throw deleteError;

      // Delete all associated images from storage
      const deleteImagePromises = notesToDelete
        .filter(note => note.image_url)
        .map(note => deleteImageFromStorage(note.image_url));

      await Promise.all(deleteImagePromises);

      queryClient.invalidateQueries({ queryKey: ['trashedNotes'] });
      toast.success(`Permanently deleted ${notesToDelete.length} notes`);
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['trashedNotes'] });
      console.error("Failed to delete all notes:", error);
      toast.error("Failed to delete all notes");
    }
  };

  return {
    trashedNotes,
    isLoading,
    handleRestore,
    handleDelete,
    handleDeleteAll,
  };
};
