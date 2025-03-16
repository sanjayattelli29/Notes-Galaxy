
import React from "react";
import { Trash2, Undo, PenLine, Pin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteManagementActionsProps {
  isInTrash?: boolean;
  is_starred: boolean;
  is_pinned: boolean;
  onStar?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onEdit?: () => void;
}

export const NoteManagementActions: React.FC<NoteManagementActionsProps> = ({
  isInTrash,
  is_starred,
  is_pinned,
  onStar,
  onPin,
  onDelete,
  onRestore,
  onEdit,
}) => {
  if (isInTrash) {
    return (
      <>
        {onRestore && (
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary"
            onClick={onRestore}
          >
            <Undo className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </>
    );
  }

  return (
    <>
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary"
          onClick={onEdit}
        >
          <PenLine className="h-4 w-4" />
        </Button>
      )}
      {onPin && (
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary"
          onClick={onPin}
        >
          <Pin
            className={`h-4 w-4 ${is_pinned ? "fill-blue-400 text-blue-400" : ""}`}
          />
        </Button>
      )}
      {onStar && (
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary"
          onClick={onStar}
        >
          <Star
            className={`h-4 w-4 ${is_starred ? "fill-yellow-400 text-yellow-400" : ""}`}
          />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};
