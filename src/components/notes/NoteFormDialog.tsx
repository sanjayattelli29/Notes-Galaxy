
import React from "react";
import { Note, Category } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useNoteForm } from "@/hooks/useNoteForm";
import { NoteFormImages } from "./NoteFormImages";
import { NoteFormContent } from "./NoteFormContent";

interface NoteFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingNote: Note | null;
  setEditingNote: (note: Note | null) => void;
  categories: Category[];
  selectedCategory?: string | null;
}

export const NoteFormDialog: React.FC<NoteFormDialogProps> = ({
  isOpen,
  setIsOpen,
  editingNote,
  setEditingNote,
  categories,
  selectedCategory,
}) => {
  const {
    noteForm,
    setNoteForm,
    handleImageUpload,
    handleRemoveImage,
    handleSaveNote
  } = useNoteForm({
    editingNote,
    selectedCategory,
    setIsOpen,
    setEditingNote
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingNote ? "Edit note" : "Create a new note"}
          </DialogTitle>
        </DialogHeader>

        <NoteFormContent 
          noteForm={noteForm}
          setNoteForm={setNoteForm}
          categories={categories}
        />

        <NoteFormImages
          noteForm={noteForm}
          handleImageUpload={handleImageUpload}
          handleRemoveImage={handleRemoveImage}
        />

        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveNote}>
            {editingNote ? "Update Note" : "Create Note"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
