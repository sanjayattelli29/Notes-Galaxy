import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { FilesHeader } from '@/components/files/FilesHeader';
import { FilesList } from '@/components/files/FilesList';
import { CreateFolderDialog } from '@/components/files/CreateFolderDialog';
import { FileUploadDialog } from '@/components/files/FileUploadDialog';
import { useFileExplorer } from '@/hooks/useFileExplorer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  ListFilter,
  Grid,
  LayoutList,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'date' | 'size';
type SortDirection = 'asc' | 'desc';

const Files = () => {
  const {
    currentFolderId,
    folders,
    files,
    breadcrumbs,
    isLoading,
    isCreateFolderDialogOpen,
    isFileUploadDialogOpen,
    setIsCreateFolderDialogOpen,
    setIsFileUploadDialogOpen,
    navigateToFolder,
    refreshData,
    handleCreateFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleFileUpload,
    handleDeleteFile,
    downloadFile
  } = useFileExplorer();

  // View mode state (grid or list)
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Sorting state
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    if (sortBy === option) {
      toggleSortDirection();
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  // Sort files and folders
  const sortedFolders = [...folders].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'date') {
      return sortDirection === 'asc'
        ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
    return 0;
  });

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'date') {
      return sortDirection === 'asc'
        ? new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else if (sortBy === 'size') {
      return sortDirection === 'asc'
        ? a.file_size - b.file_size
        : b.file_size - a.file_size;
    }
    return 0;
  });

  return (
    <Layout>
      <div className="w-full mx-auto p-2 md:p-6 max-w-[1600px]">
        <FilesHeader
          breadcrumbs={breadcrumbs}
          onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
          onUploadFile={() => setIsFileUploadDialogOpen(true)}
          onNavigate={navigateToFolder}
          onRefresh={refreshData}
          isLoading={isLoading}
        />

        {/* View and Sort Controls - Redesigned for better responsiveness */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 my-4 pb-4 border-b">
          {/* View mode controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('grid')}
              className="w-12"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setViewMode('list')}
              className="w-12"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sort controls - Responsive design */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dropdown for mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="sm:hidden">
                <Button variant="outline" size="sm" className="w-full">
                  <ListFilter className="h-4 w-4 mr-2" />
                  Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} ({sortDirection === 'asc' ? '↑' : '↓'})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={() => handleSortChange('name')}>
                  Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('date')}>
                  Last modified {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('size')}>
                  Size {sortBy === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleSortDirection}>
                  Toggle order: {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Desktop view for sort options */}
            <div className="hidden sm:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="min-w-[120px]">
                    <ListFilter className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sort by:</span> {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                    <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSortChange('name')}>
                    Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('date')}>
                    Last modified {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSortChange('size')}>
                    Size {sortBy === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSortDirection}
                className="min-w-[100px]"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-32 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-8 w-32 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <FilesList
            folders={sortedFolders}
            files={sortedFiles}
            viewMode={viewMode}
            onNavigateToFolder={navigateToFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onDownloadFile={downloadFile}
            onDeleteFile={handleDeleteFile}
            onCreateFolder={() => setIsCreateFolderDialogOpen(true)}
            onUploadFile={() => setIsFileUploadDialogOpen(true)}
          />
        )}

        <CreateFolderDialog
          isOpen={isCreateFolderDialogOpen}
          onClose={() => setIsCreateFolderDialogOpen(false)}
          onCreateFolder={handleCreateFolder}
        />

        <FileUploadDialog
          isOpen={isFileUploadDialogOpen}
          onClose={() => setIsFileUploadDialogOpen(false)}
          onUploadFile={handleFileUpload}
        />
      </div>
    </Layout>
  );
};

export default Files;