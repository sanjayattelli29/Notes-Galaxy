
import React from "react";
import { Note } from "@/lib/api/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Note;
  categoryColor: string;
  onEdit: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, categoryColor, onEdit }) => {
  const formattedDate = formatDistanceToNow(new Date(task.created_at), {
    addSuffix: true,
  });

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md animate-fade-in cursor-pointer border-l-4" style={{ borderLeftColor: `var(--${categoryColor.split('-')[1]})` }}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium line-clamp-1">{task.title}</h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Edit task"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
          {task.content}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between px-3 py-2 bg-muted/30">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
        {task.is_starred && (
          <Badge variant="secondary" className="text-xs px-2 py-0">
            Important
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};
