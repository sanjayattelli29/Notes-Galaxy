
import React from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api/categories";
import type { Category } from "@/lib/api/types";
import { NoteFormDialog } from "@/components/notes/NoteFormDialog";
import { NotesList } from "@/components/notes/NotesList";
import { NotesLoading } from "@/components/notes/NotesLoading";
import { EmptyNotesState } from "@/components/notes/EmptyNotesState";
import { useStarredNotes } from "@/hooks/useStarredNotes";

const Starred = () => {
  const {
    pinnedNotes,
    regularNotes,
    isLoading,
    editingNote,
    setEditingNote,
    isOpen,
    setIsOpen,
    handleStar,
    handlePin,
    handleDelete,
    handleOpenEdit,
  } = useStarredNotes();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <Layout>
        <NotesLoading />
      </Layout>
    );
  }

  const hasNotes = pinnedNotes.length > 0 || regularNotes.length > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Starred Notes</h1>
          <NoteFormDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingNote={editingNote}
            setEditingNote={setEditingNote}
            categories={categories}
          />
        </div>

        {!hasNotes ? (
          <EmptyNotesState message="You don't have any starred notes yet." />
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <NotesList
                notes={pinnedNotes}
                categories={categories}
                onStar={handleStar}
                onPin={handlePin}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
                title="Pinned Starred Notes"
              />
            )}

            {regularNotes.length > 0 && (
              <NotesList
                notes={regularNotes}
                categories={categories}
                onStar={handleStar}
                onPin={handlePin}
                onDelete={handleDelete}
                onEdit={handleOpenEdit}
                title={pinnedNotes.length > 0 ? "Other Starred Notes" : "Starred Notes"}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Starred;
