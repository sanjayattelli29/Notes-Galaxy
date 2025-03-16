
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";

interface FileTrashHeaderProps {
  hasFiles: boolean;
  onEmptyTrash: () => Promise<void>;
}

export const FileTrashHeader: React.FC<FileTrashHeaderProps> = ({
  hasFiles,
  onEmptyTrash,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold">File Trash</h1>
        <p className="text-muted-foreground mt-1">
          Files in trash will be automatically deleted after 30 days
        </p>
      </div>
      
      {hasFiles && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Empty Trash
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete all files?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all files
                in your trash and remove the data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onEmptyTrash}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
