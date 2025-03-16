
import { useState } from 'react';
import { useFileExplorerData } from './files/useFileExplorerData';
import { useFolderOperations } from './files/useFolderOperations';
import { useFileOperations } from './files/useFileOperations';

export const useFileExplorer = (initialFolderId: string | null = null) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId);
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] = useState(false);

  // Data fetching hook
  const {
    folders,
    files,
    breadcrumbs,
    isLoading,
    refreshData
  } = useFileExplorerData(currentFolderId);

  // Folder operations hook
  const {
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
  } = useFolderOperations(currentFolderId);

  // File operations hook
  const {
    handleFileUpload,
    handleDeleteFile,
    downloadFile,
  } = useFileOperations(currentFolderId);

  // Navigate to folder
  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  return {
    // State
    currentFolderId,
    folders,
    files,
    breadcrumbs,
    isLoading,
    isCreateFolderDialogOpen,
    isFileUploadDialogOpen,
    
    // Dialog controls
    setIsCreateFolderDialogOpen,
    setIsFileUploadDialogOpen,
    
    // Actions
    navigateToFolder,
    refreshData,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleFileUpload,
    handleDeleteFile,
    downloadFile
  };
};
