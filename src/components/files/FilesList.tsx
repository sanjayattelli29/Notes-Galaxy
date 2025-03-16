
import React, { useState } from 'react';
import { FolderItem } from './FolderItem';
import { FileItem } from './FileItem';
import { UserFolder, UserFile } from '@/lib/api/files-types';
import { EmptyFilesState } from './EmptyFilesState';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface FilesListProps {
  folders: UserFolder[];
  files: UserFile[];
  viewMode: 'grid' | 'list';
  onNavigateToFolder: (id: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onDownloadFile: (id: string, name: string) => void;
  onDeleteFile: (id: string) => void;
  onCreateFolder: () => void;
  onUploadFile: () => void;
}

export const FilesList: React.FC<FilesListProps> = ({
  folders,
  files,
  viewMode,
  onNavigateToFolder,
  onRenameFolder,
  onDeleteFolder,
  onDownloadFile,
  onDeleteFile,
  onCreateFolder,
  onUploadFile,
}) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const visibleFiles = files.filter(file => !file.deleted_at);
  const isEmpty = folders.length === 0 && visibleFiles.length === 0;

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleToggleSelectionMode = () => {
    if (selectionMode) {
      // Exiting selection mode
      setSelectedFiles([]);
      setSelectedFolders([]);
    }
    setSelectionMode(!selectionMode);
  };

  const handleDeleteSelected = () => {
    // Delete selected files
    selectedFiles.forEach(fileId => {
      onDeleteFile(fileId);
    });
    
    // Delete selected folders
    selectedFolders.forEach(folderId => {
      onDeleteFolder(folderId);
    });
    
    // Reset selection
    setSelectedFiles([]);
    setSelectedFolders([]);
    setSelectionMode(false);
    setIsDeleteDialogOpen(false);
  };

  const totalSelected = selectedFiles.length + selectedFolders.length;

  if (isEmpty) {
    return (
      <EmptyFilesState
        onCreateFolder={onCreateFolder}
        onUploadFile={onUploadFile}
      />
    );
  }

  // Selection controls that appear when in selection mode
  const renderSelectionControls = () => {
    if (!selectionMode) return null;
    
    return (
      <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-md">
        <span className="text-sm font-medium">
          {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
        </span>
        <div className="ml-auto flex items-center gap-2">
          {totalSelected > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleSelectionMode}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {!selectionMode && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToggleSelectionMode} 
            className="mb-30 mx-25 my--10 px-4 py-2"
          
          >
            Select Multiple
          </Button>
        )}
        
        {renderSelectionControls()}

        <div className="bg-background border rounded-lg shadow-sm">
          <div className="grid grid-cols-12 gap-2 p-3 border-b font-medium text-sm">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Last modified</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {folders.length > 0 && (
            <div className="divide-y">
              {folders.map((folder) => (
                <div key={folder.id} className="grid grid-cols-12 gap-2 p-3 hover:bg-accent/50 transition-colors">
                  <div className="col-span-6 flex items-center">
                    <FolderItem
                      id={folder.id}
                      name={folder.name}
                      viewMode="list"
                      onNavigate={onNavigateToFolder}
                      onRename={onRenameFolder}
                      onDelete={onDeleteFolder}
                      isSelected={selectedFolders.includes(folder.id)}
                      onToggleSelect={() => toggleFolderSelection(folder.id)}
                      selectionMode={selectionMode}
                    />
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    {format(new Date(folder.updated_at), 'MMM d, yyyy')}
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-muted-foreground">
                    —
                  </div>
                  <div className="col-span-2">
                    {/* Actions are inside FolderItem */}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {visibleFiles.length > 0 && (
            <div className="divide-y">
              {visibleFiles.map((file) => (
                <div key={file.id} className="grid grid-cols-12 gap-2">
                  <div className="col-span-12">
                    <FileItem
                      id={file.id}
                      name={file.name}
                      type={file.file_type}
                      size={file.file_size}
                      url={file.url}
                      created_at={file.created_at}
                      updated_at={file.updated_at}
                      viewMode="list"
                      onDownload={onDownloadFile}
                      onDelete={onDeleteFile}
                      isSelected={selectedFiles.includes(file.id)}
                      onToggleSelect={() => toggleFileSelection(file.id)}
                      selectionMode={selectionMode}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {totalSelected} item{totalSelected !== 1 ? 's' : ''}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Selected items will be moved to the trash.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

    return (
<div className="relative">
{!selectionMode && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleToggleSelectionMode} 
            className="absolute top-0 right-0 px-4 py-2"
            >
            Select Multiple
          </Button>
        )}
      
      {renderSelectionControls()}

      {folders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2"></h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3">
            {folders.map((folder) => (
              <FolderItem
                key={folder.id}
                id={folder.id}
                name={folder.name}
                viewMode="grid"
                onNavigate={onNavigateToFolder}
                onRename={onRenameFolder}
                onDelete={onDeleteFolder}
                isSelected={selectedFolders.includes(folder.id)}
                onToggleSelect={() => toggleFolderSelection(folder.id)}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Files</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-3">
            {files.map((file) => (
              <FileItem
                key={file.id}
                id={file.id}
                name={file.name}
                type={file.file_type}
                size={file.file_size}
                url={file.url}
                created_at={file.created_at}
                updated_at={file.updated_at}
                viewMode="grid"
                onDownload={onDownloadFile}
                onDelete={onDeleteFile}
                isSelected={selectedFiles.includes(file.id)}
                onToggleSelect={() => toggleFileSelection(file.id)}
                selectionMode={selectionMode}
              />
            ))}
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {totalSelected} item{totalSelected !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Selected items will be moved to the trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
