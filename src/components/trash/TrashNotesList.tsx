
import React from "react";
import { NoteCard } from "@/components/NoteCard";
import type { Note } from "@/lib/api/types";

interface TrashNotesListProps {
  notes: Note[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TrashNotesList: React.FC<TrashNotesListProps> = ({
  notes,
  onRestore,
  onDelete,
}) => {
  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          {...note}
          categoryColor={`bg-${note.category}-100 dark:bg-${note.category}-900`}
          onRestore={() => onRestore(note.id)}
          onDelete={() => onDelete(note.id)}
          isInTrash
        />
      ))}
    </div>
  );
};
