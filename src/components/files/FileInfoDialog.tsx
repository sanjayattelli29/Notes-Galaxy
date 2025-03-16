
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { formatFileSize } from './FileUtils';

interface FileInfoDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  type: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export const FileInfoDialog: React.FC<FileInfoDialogProps> = ({
  isOpen,
  onOpenChange,
  name,
  type,
  size,
  created_at,
  updated_at,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>File information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
            <p>{name}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
            <p>{type}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
            <p>{formatFileSize(size)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
            <p>{format(new Date(created_at), 'PPP p')}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Modified</h4>
            <p>{format(new Date(updated_at), 'PPP p')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
