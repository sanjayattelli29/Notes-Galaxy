
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserFile } from '@/lib/api/files-types';
import { 
  getTrashedFiles, 
  restoreFileFromTrash, 
  permanentlyDeleteFile, 
  emptyTrash 
} from '@/lib/api/files';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays } from 'date-fns';

export const useTrashFiles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for trashed files
  const { 
    data: trashedFiles = [],
    isLoading: isQueryLoading,
    refetch
  } = useQuery({
    queryKey: ['trashed-files'],
    queryFn: getTrashedFiles,
  });

  // Restore file mutation
  const restoreFileMutation = useMutation({
    mutationFn: restoreFileFromTrash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-files'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast({
        title: 'File restored',
        description: 'The file has been restored successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to restore file. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Delete file permanently mutation
  const deleteFileMutation = useMutation({
    mutationFn: permanentlyDeleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-files'] });
      toast({
        title: 'File deleted',
        description: 'The file has been permanently deleted.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete file. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Empty trash mutation
  const emptyTrashMutation = useMutation({
    mutationFn: emptyTrash,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashed-files'] });
      toast({
        title: 'Trash emptied',
        description: 'All files in trash have been permanently deleted.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to empty trash. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Calculate days until auto-deletion for each file
  const filesWithDaysLeft = trashedFiles.map(file => {
    if (!file.deleted_at) return { ...file, daysLeft: 30 };
    
    const deletedDate = new Date(file.deleted_at);
    const daysLeft = 30 - differenceInDays(new Date(), deletedDate);
    return {
      ...file,
      daysLeft: Math.max(0, daysLeft)
    };
  });

  // Handle restore file
  const handleRestore = async (fileId: string) => {
    restoreFileMutation.mutate(fileId);
  };

  // Handle delete file
  const handleDelete = async (fileId: string) => {
    deleteFileMutation.mutate(fileId);
  };

  // Handle empty trash
  const handleEmptyTrash = async () => {
    setIsLoading(true);
    try {
      await emptyTrashMutation.mutateAsync();
    } finally {
      setIsLoading(false);
    }
  };

  return {
    trashedFiles: filesWithDaysLeft,
    isLoading: isQueryLoading || isLoading,
    handleRestore,
    handleDelete,
    handleEmptyTrash,
    refreshTrash: refetch
  };
};
