
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserFile } from '@/lib/api/files-types';
import { format, formatDistanceToNow } from 'date-fns';
import { FileIcon } from '@/components/files/FileIcon';
import { formatFileSize } from '@/components/files/FileUtils';
import { Trash2, ArrowUpCircle, Clock, X, Checkbox as CheckIcon } from 'lucide-react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface FileTrashListProps {
  files: Array<UserFile & { daysLeft: number }>;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FileTrashList: React.FC<FileTrashListProps> = ({ files, onRestore, onDelete }) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleToggleSelectionMode = () => {
    if (selectionMode) {
      // Exiting selection mode
      setSelectedFiles([]);
    }
    setSelectionMode(!selectionMode);
  };

  const handleRestoreSelected = () => {
    // Restore selected files
    selectedFiles.forEach(fileId => {
      onRestore(fileId);
    });
    
    // Reset selection
    setSelectedFiles([]);
    setSelectionMode(false);
    setIsRestoreDialogOpen(false);
  };

  const handleDeleteSelected = () => {
    // Delete selected files
    selectedFiles.forEach(fileId => {
      onDelete(fileId);
    });
    
    // Reset selection
    setSelectedFiles([]);
    setSelectionMode(false);
    setIsDeleteDialogOpen(false);
  };

  const totalSelected = selectedFiles.length;

  return (
    <div className="space-y-4">
      {!selectionMode && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleSelectionMode} 
          className="mb-3"
        >
          Select Multiple
        </Button>
      )}
      
      {selectionMode && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">
            {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
          </span>
          <div className="ml-auto flex items-center gap-2">
            {totalSelected > 0 && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsRestoreDialogOpen(true)}
                >
                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                  Restore Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </Button>
              </>
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
      )}
    
      <div className="bg-card border rounded-md">
        <div className="grid grid-cols-12 gap-2 p-3 border-b font-medium text-sm">
          <div className="col-span-5 sm:col-span-6">Name</div>
          <div className="col-span-3 sm:col-span-2">Type</div>
          <div className="col-span-2">Days Left</div>
          <div className="col-span-2">Actions</div>
        </div>
        <div className="divide-y">
          {files.map((file) => (
            <div key={file.id} className={`grid grid-cols-12 gap-2 p-3 items-center ${selectedFiles.includes(file.id) ? 'bg-accent/30' : 'hover:bg-accent/20'}`}>
              <div className="col-span-5 sm:col-span-6 flex items-center space-x-2 truncate">
                {selectionMode && (
                  <Checkbox 
                    checked={selectedFiles.includes(file.id)} 
                    onCheckedChange={() => toggleFileSelection(file.id)}
                    className="mr-1"
                    id={`file-select-${file.id}`}
                  />
                )}
                <FileIcon fileType={file.file_type} viewMode="list" />
                <span className="font-medium truncate text-xs sm:text-sm" title={file.name}>{file.name}</span>
              </div>
              <div className="col-span-3 sm:col-span-2 text-xs sm:text-sm text-muted-foreground truncate">
                {file.file_type.split('/').pop()?.toUpperCase() || 'FILE'}
              </div>
              <div className="col-span-2 text-xs sm:text-sm flex items-center">
                <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                <span className={file.daysLeft < 5 ? 'text-red-500 font-medium' : ''}>
                  {file.daysLeft} days
                </span>
              </div>
              <div className="col-span-2 flex items-center space-x-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRestore(file.id)} title="Restore">
                  <ArrowUpCircle className="h-4 w-4 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(file.id)} title="Delete permanently">
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore {totalSelected} item{totalSelected !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the selected items out of the trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreSelected}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently delete {totalSelected} item{totalSelected !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected items will be permanently deleted from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
