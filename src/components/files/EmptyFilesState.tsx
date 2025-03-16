
import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyFilesStateProps {
  onCreateFolder: () => void;
  onUploadFile: () => void;
}

export const EmptyFilesState: React.FC<EmptyFilesStateProps> = ({
  onCreateFolder,
  onUploadFile
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FolderOpen className="h-20 w-20 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">This folder is empty</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Start by creating a new folder or uploading a file.
      </p>
      <div className="flex gap-4">
        <Button onClick={onCreateFolder} variant="outline">
          Create Folder
        </Button>
        <Button onClick={onUploadFile}>
          Upload File
        </Button>
      </div>
    </div>
  );
};
