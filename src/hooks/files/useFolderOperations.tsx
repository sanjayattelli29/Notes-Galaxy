
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserFolder } from '@/lib/api/files-types';
import { createFolder, renameFolder, deleteFolder } from '@/lib/api/files';
import { useToast } from '@/hooks/use-toast';

export const useFolderOperations = (currentFolderId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: (name: string) => createFolder(name, currentFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', currentFolderId] });
      toast({
        title: 'Folder created',
        description: 'The folder has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create folder. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Rename folder mutation
  const renameFolderMutation = useMutation({
    mutationFn: ({ folderId, newName }: { folderId: string; newName: string }) => 
      renameFolder(folderId, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', currentFolderId] });
      toast({
        title: 'Folder renamed',
        description: 'The folder has been renamed successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to rename folder. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Delete folder mutation
  const deleteFolderMutation = useMutation({
    mutationFn: (folderId: string) => deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders', currentFolderId] });
      toast({
        title: 'Folder deleted',
        description: 'The folder and its contents have been deleted.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete folder. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Create a new folder
  const handleCreateFolder = (name: string) => {
    createFolderMutation.mutate(name);
  };

  // Rename a folder
  const handleRenameFolder = (folderId: string, newName: string) => {
    renameFolderMutation.mutate({ folderId, newName });
  };

  // Delete a folder
  const handleDeleteFolder = (folderId: string) => {
    deleteFolderMutation.mutate(folderId);
  };

  return {
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    isCreatingFolder: createFolderMutation.isPending,
    isRenamingFolder: renameFolderMutation.isPending,
    isDeletingFolder: deleteFolderMutation.isPending,
  };
};
