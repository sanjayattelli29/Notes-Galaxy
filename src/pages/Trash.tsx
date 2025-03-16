
import React from "react";
import { Layout } from "@/components/Layout";
import { NotesLoading } from "@/components/notes/NotesLoading";
import { useTrashNotes } from "@/hooks/useTrashNotes";
import { EmptyTrashState } from "@/components/trash/EmptyTrashState";
import { TrashNotesList } from "@/components/trash/TrashNotesList";
import { TrashHeader } from "@/components/trash/TrashHeader";

const Trash = () => {
  const {
    trashedNotes,
    isLoading,
    handleRestore,
    handleDelete,
    handleDeleteAll,
  } = useTrashNotes();

  if (isLoading) {
    return <NotesLoading />;
  }

  const hasNotes = trashedNotes.length > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <TrashHeader 
          hasNotes={hasNotes}
          onDeleteAll={handleDeleteAll}
        />
        
        {!hasNotes ? (
          <EmptyTrashState />
        ) : (
          <TrashNotesList
            notes={trashedNotes}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        )}
      </div>
    </Layout>
  );
};

export default Trash;
