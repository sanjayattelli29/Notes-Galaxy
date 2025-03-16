
import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api/categories";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { Category, Note } from "@/lib/api/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

const TaskManagement = () => {
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Note | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Note[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('notes')  // We're still using the notes table but we'll treat certain notes as tasks
        .select('*')
        .eq('user_id', session.user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to fetch tasks');
        throw error;
      }

      return data as Note[];
    },
  });

  const isLoading = categoriesLoading || tasksLoading;

  return (
    <Layout>
      <div className="max-w-full mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">Task Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your tasks using kanban boards based on categories
            </p>
          </div>
          <Button 
            onClick={() => {
              setEditingTask(null);
              setIsTaskFormOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <KanbanBoard 
            tasks={tasks} 
            categories={categories}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskFormOpen(true);
            }}
          />
        )}

        <TaskFormDialog
          isOpen={isTaskFormOpen}
          setIsOpen={setIsTaskFormOpen}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
          categories={categories}
        />
      </div>
    </Layout>
  );
};

export default TaskManagement;
