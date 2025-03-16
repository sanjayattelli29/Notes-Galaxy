
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFile, deleteFile, getFileDownloadUrl } from '@/lib/api/files';
import { useToast } from '@/hooks/use-toast';

export const useFileOperations = (currentFolderId: string | null) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file, currentFolderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] });
      toast({
        title: 'File uploaded',
        description: 'The file has been uploaded successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', currentFolderId] });
      toast({
        title: 'File deleted',
        description: 'The file has been deleted successfully.',
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

  // Download file
  const downloadFile = async (fileId: string, fileName: string) => {
    try {
      const url = await getFileDownloadUrl(fileId);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to download file. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Upload a file
  const handleFileUpload = (file: File) => {
    uploadFileMutation.mutate(file);
  };

  // Delete a file
  const handleDeleteFile = (fileId: string) => {
    deleteFileMutation.mutate(fileId);
  };

  return {
    handleFileUpload,
    handleDeleteFile,
    downloadFile,
    isUploadingFile: uploadFileMutation.isPending,
    isDeletingFile: deleteFileMutation.isPending,
  };
};
