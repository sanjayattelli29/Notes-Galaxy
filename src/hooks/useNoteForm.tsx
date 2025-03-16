
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Note } from "@/lib/api/types";

export interface NoteFormState {
  title: string;
  content: string;
  category: string;
  link: string;
  images: File[];
  image_urls: string[];
}

interface UseNoteFormProps {
  editingNote: Note | null;
  selectedCategory?: string | null;
  setIsOpen: (isOpen: boolean) => void;
  setEditingNote: (note: Note | null) => void;
}

export const useNoteForm = ({
  editingNote,
  selectedCategory,
  setIsOpen,
  setEditingNote,
}: UseNoteFormProps) => {
  const queryClient = useQueryClient();
  const [noteForm, setNoteForm] = useState<NoteFormState>({
    title: "",
    content: "",
    category: selectedCategory || "personal",
    link: "",
    images: [],
    image_urls: [],
  });

  // Initialize form when editing note changes
  useEffect(() => {
    if (editingNote) {
      setNoteForm({
        title: editingNote.title || "",
        content: editingNote.content || "",
        category: editingNote.category || "personal",
        link: editingNote.link || "",
        images: [],
        image_urls: editingNote?.image_url ? editingNote.image_url.split(',').map(url => url.trim()) : [],
      });
    } else {
      setNoteForm({
        title: "",
        content: "",
        category: selectedCategory || "personal",
        link: "",
        images: [],
        image_urls: [],
      });
    }
  }, [editingNote, selectedCategory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files);
      setNoteForm(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const handleRemoveImage = (index: number, isUploadedImage: boolean) => {
    setNoteForm(prev => {
      if (isUploadedImage) {
        const updatedUrls = [...prev.image_urls];
        updatedUrls.splice(index, 1);
        return { ...prev, image_urls: updatedUrls };
      } else {
        const updatedImages = [...prev.images];
        updatedImages.splice(index, 1);
        return { ...prev, images: updatedImages };
      }
    });
  };

  const uploadImages = async () => {
    if (noteForm.images.length === 0) {
      return noteForm.image_urls.join(',');
    }

    const uploadPromises = noteForm.images.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('notes-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('notes-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    const allUrls = [...noteForm.image_urls, ...uploadedUrls];
    return allUrls.join(',');
  };

  const handleSaveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to create notes");
        return;
      }

      let image_url = "";
      
      if (noteForm.images.length > 0 || noteForm.image_urls.length > 0) {
        image_url = await uploadImages();
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: noteForm.title,
            content: noteForm.content,
            category: noteForm.category,
            link: noteForm.link || null,
            image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingNote.id);

        if (error) throw error;
        toast.success("Note updated successfully");
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{
            title: noteForm.title,
            content: noteForm.content,
            category: noteForm.category,
            link: noteForm.link || null,
            image_url,
            user_id: session.user.id,
            is_pinned: false,
            is_starred: false,
          }]);

        if (error) throw error;
        toast.success("Note created successfully");
      }

      queryClient.invalidateQueries({ 
        queryKey: ['notes'],
        refetchType: 'all'
      });
      
      setNoteForm({ title: "", content: "", category: "personal", link: "", images: [], image_urls: [] });
      setEditingNote(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(`Failed to ${editingNote ? 'update' : 'create'} note`);
    }
  };

  return {
    noteForm,
    setNoteForm,
    handleImageUpload,
    handleRemoveImage,
    handleSaveNote
  };
};
