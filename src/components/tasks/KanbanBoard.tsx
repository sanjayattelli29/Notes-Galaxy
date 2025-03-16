
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Note, Category } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface KanbanBoardProps {
  tasks: Note[];
  categories: Category[];
  onEditTask: (task: Note) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, categories, onEditTask }) => {
  const queryClient = useQueryClient();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Function to toggle expanded category
  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list or same position
    if (!destination || 
      (destination.droppableId === source.droppableId && 
        destination.index === source.index)) {
      return;
    }

    const newCategory = destination.droppableId;
    const taskId = draggableId;

    try {
      // Optimistic update
      queryClient.setQueryData(['tasks'], (oldData: Note[] = []) => {
        return oldData.map(task => 
          task.id === taskId ? { ...task, category: newCategory } : task
        );
      });

      // Update in database
      const { error } = await supabase
        .from('notes')
        .update({ category: newCategory })
        .eq('id', taskId);

      if (error) throw error;
      toast.success(`Task moved to ${newCategory}`);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
    } catch (error) {
      console.error('Error updating task category:', error);
      toast.error("Failed to move task");
      
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  };

  // Group tasks by category
  const tasksByCategory = categories.reduce((acc, category) => {
    const categoryName = category.name.toLowerCase();
    acc[categoryName] = tasks.filter(
      task => task.category.toLowerCase() === categoryName
    );
    return acc;
  }, {} as Record<string, Note[]>);

  // Additional category for tasks without a matching category
  const uncategorizedTasks = tasks.filter(
    task => !categories.some(c => c.name.toLowerCase() === task.category.toLowerCase())
  );
  if (uncategorizedTasks.length > 0) {
    tasksByCategory['uncategorized'] = uncategorizedTasks;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="mt-6">
        <div className="flex space-x-4 mb-2 overflow-x-auto custom-scrollbar pb-2">
          {/* Navigation buttons for horizontal scrolling on mobile */}
          <button 
            className="hidden sm:flex sticky left-0 items-center justify-center h-8 w-8 rounded-full bg-accent hover:bg-accent/80 text-accent-foreground"
            onClick={() => {
              const container = document.querySelector('.kanban-container');
              if (container) {
                container.scrollLeft -= 300;
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="flex space-x-4 kanban-container overflow-x-auto custom-scrollbar pb-2 flex-1 pl-1 pr-1">
            {Object.entries(tasksByCategory).map(([categoryName, categoryTasks]) => {
              const category = categories.find(c => c.name.toLowerCase() === categoryName) || {
                name: 'Uncategorized',
                color: 'bg-gray-200 dark:bg-gray-700',
                id: 'uncategorized'
              };
              
              const isExpanded = expandedCategory === categoryName;
              
              return (
                <div 
                  key={categoryName}
                  className={`flex-shrink-0 w-80 bg-background border rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-280px)]`}
                >
                  <div 
                    className="p-3 border-b flex items-center justify-between cursor-pointer hover:bg-accent/50"
                    onClick={() => toggleCategory(categoryName)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <h3 className="font-medium capitalize">{category.name}</h3>
                      <Badge variant="outline" className="ml-1">{categoryTasks.length}</Badge>
                    </div>
                  </div>
                  
                  <Droppable droppableId={categoryName}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="flex-1 p-2 overflow-y-auto custom-scrollbar"
                      >
                        {categoryTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-2 ${snapshot.isDragging ? 'opacity-80' : ''}`}
                              >
                                <TaskCard 
                                  task={task} 
                                  categoryColor={category.color}
                                  onEdit={() => onEditTask(task)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
          
          <button 
            className="hidden sm:flex sticky right-0 items-center justify-center h-8 w-8 rounded-full bg-accent hover:bg-accent/80 text-accent-foreground"
            onClick={() => {
              const container = document.querySelector('.kanban-container');
              if (container) {
                container.scrollLeft += 300;
              }
            }}
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </DragDropContext>
  );
};
