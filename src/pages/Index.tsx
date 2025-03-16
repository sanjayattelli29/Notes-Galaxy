
import React from "react";
import { Layout } from "@/components/Layout";
import { useSearchParams } from "react-router-dom";
import { NoteFormDialog } from "@/components/notes/NoteFormDialog";
import { NotesList } from "@/components/notes/NotesList";
import { useNotes } from "@/hooks/useNotes";
import { NotesLoading } from "@/components/notes/NotesLoading";
import { EmptyNotesState } from "@/components/notes/EmptyNotesState";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api/categories";
import type { Category } from "@/lib/api/types";

const Index = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category')?.toLowerCase();
  
  const {
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
  } = useNotes(selectedCategory);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return <NotesLoading />;
  }

  const hasNotes = (pinnedNotes.length > 0 || regularNotes.length > 0);

  return (
    <Layout>
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">My Notes</h1>
            <p className="text-muted-foreground mt-1">
              {selectedCategory 
                ? `Showing notes in category: ${selectedCategory}`
                : 'Create and manage your notes'}
            </p>
          </div>
          <NoteFormDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            editingNote={editingNote}
            setEditingNote={setEditingNote}
            categories={categories}
            selectedCategory={selectedCategory}
          />
        </div>

        {!hasNotes && (
          <EmptyNotesState 
            message={
              selectedCategory
                ? `No notes found in the "${selectedCategory}" category. Create your first note in this category!`
                : "You don't have any notes yet. Create your first note to get started!"
            }
          />
        )}

        {/* Pinned notes section */}
        <NotesList
          notes={pinnedNotes}
          categories={categories}
          onStar={handleStar}
          onPin={handlePin}
          onDelete={handleDelete}
          onEdit={handleOpenEdit}
          title="Pinned Notes"
        />

        {/* Main notes section */}
        <NotesList
          notes={regularNotes}
          categories={categories}
          onStar={handleStar}
          onPin={handlePin}
          onDelete={handleDelete}
          onEdit={handleOpenEdit}
          title="All Notes"
        />
      </div>
    </Layout>
  );
};

export default Index;
