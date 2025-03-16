
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FileDeleteAlertProps {
  children: React.ReactNode;
  onDelete: () => void;
  title?: string;
  description?: string;
  deleteButtonText?: string;
  cancelButtonText?: string;
}

export const FileDeleteAlert: React.FC<FileDeleteAlertProps> = ({
  children,
  onDelete,
  title = "Are you sure?",
  description = "This will permanently delete the file. This action cannot be undone.",
  deleteButtonText = "Delete",
  cancelButtonText = "Cancel",
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>{cancelButtonText}</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onDelete}
          >
            {deleteButtonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
