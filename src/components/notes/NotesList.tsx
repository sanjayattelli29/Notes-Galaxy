
import React from "react";
import { Note, Category } from "@/lib/api/types";
import { NoteCard } from "@/components/NoteCard";

interface NotesListProps {
  notes: Note[];
  categories: Category[];
  onStar: (id: string, isStarred: boolean) => void;
  onPin: (id: string, isPinned: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  title: string;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  categories,
  onStar,
  onPin,
  onDelete,
  onEdit,
  title,
}) => {
  if (notes.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4 mt-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {notes.map((note) => {
          const category = categories.find(
            (c) => c.name.toLowerCase() === note.category.toLowerCase()
          );
          return (
            <NoteCard
              key={note.id}
              {...note}
              categoryColor={category?.color || "bg-gray-100 dark:bg-gray-800"}
              onStar={() => onStar(note.id, note.is_starred)}
              onPin={() => onPin(note.id, note.is_pinned)}
              onDelete={() => onDelete(note.id)}
              onEdit={() => onEdit(note)}
            />
          );
        })}
      </div>
    </>
  );
};
