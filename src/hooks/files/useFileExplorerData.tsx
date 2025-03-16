
import { useQuery } from '@tanstack/react-query';
import { UserFolder, UserFile, BreadcrumbItem } from '@/lib/api/files-types';
import { getUserFolders, getUserFiles, getFolderBreadcrumb } from '@/lib/api/files';

export const useFileExplorerData = (currentFolderId: string | null) => {
  // Query for folders
  const { 
    data: folders = [], 
    isLoading: isFoldersLoading,
    refetch: refetchFolders
  } = useQuery({
    queryKey: ['folders', currentFolderId],
    queryFn: () => getUserFolders(currentFolderId),
  });

  // Query for files
  const { 
    data: files = [], 
    isLoading: isFilesLoading,
    refetch: refetchFiles
  } = useQuery({
    queryKey: ['files', currentFolderId],
    queryFn: () => getUserFiles(currentFolderId),
  });

  // Query for breadcrumbs
  const { 
    data: breadcrumbs = [], 
    isLoading: isBreadcrumbsLoading,
    refetch: refetchBreadcrumbs
  } = useQuery({
    queryKey: ['breadcrumbs', currentFolderId],
    queryFn: () => getFolderBreadcrumb(currentFolderId),
  });

  // Refresh all data
  const refreshData = () => {
    refetchFolders();
    refetchFiles();
    refetchBreadcrumbs();
  };

  return {
    folders,
    files,
    breadcrumbs,
    isLoading: isFoldersLoading || isFilesLoading || isBreadcrumbsLoading,
    refreshData
  };
};
