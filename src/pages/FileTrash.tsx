
import React, { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { NotesLoading } from "@/components/notes/NotesLoading";
import { useTrashFiles } from "@/hooks/useTrashFiles";
import { EmptyTrashState } from "@/components/trash/EmptyTrashState";
import { FileTrashList } from "@/components/trash/FileTrashList";
import { FileTrashHeader } from "@/components/trash/FileTrashHeader";
import { useToast } from "@/hooks/use-toast";

const FileTrash = () => {
  const {
    trashedFiles,
    isLoading,
    handleRestore,
    handleDelete,
    handleEmptyTrash,
    refreshTrash
  } = useTrashFiles();
  
  const { toast } = useToast();

  useEffect(() => {
    // Refresh data when the component mounts
    refreshTrash();
  }, [refreshTrash]);

  if (isLoading) {
    return <NotesLoading />;
  }

  const hasFiles = trashedFiles.length > 0;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4">
        <FileTrashHeader 
          hasFiles={hasFiles}
          onEmptyTrash={handleEmptyTrash}
        />
        
        {!hasFiles ? (
          <EmptyTrashState />
        ) : (
          <FileTrashList
            files={trashedFiles}
            onRestore={handleRestore}
            onDelete={handleDelete}
          />
        )}
      </div>
    </Layout>
  );
};

export default FileTrash;
