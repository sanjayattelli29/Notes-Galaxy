
import React from "react";

interface EmptyNotesStateProps {
  message: string;
}

export const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({ message }) => {
  return (
    <div className="text-center py-16 w-full flex flex-col items-center justify-center min-h-[300px]">
      <p className="text-muted-foreground max-w-md">{message}</p>
    </div>
  );
};
