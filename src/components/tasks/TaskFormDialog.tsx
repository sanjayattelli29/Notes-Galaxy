
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Note, Category } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TaskFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingTask: Note | null;
  setEditingTask: (note: Note | null) => void;
  categories: Category[];
}

interface TaskFormState {
  title: string;
  content: string;
  category: string;
}

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  isOpen,
  setIsOpen,
  editingTask,
  setEditingTask,
  categories,
}) => {
  const queryClient = useQueryClient();
  
  const [taskForm, setTaskForm] = useState<TaskFormState>({
    title: "",
    content: "",
    category: "personal",
  });

  useEffect(() => {
    if (editingTask) {
      setTaskForm({
        title: editingTask.title || "",
        content: editingTask.content || "",
        category: editingTask.category || "personal",
      });
    } else {
      // Reset form when not editing
      setTaskForm({
        title: "",
        content: "",
        category: "personal",
      });
    }
  }, [editingTask]);

  const handleSaveTask = async () => {
    if (!taskForm.title.trim() || !taskForm.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to create tasks");
        return;
      }

      if (editingTask) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: taskForm.title,
            content: taskForm.content,
            category: taskForm.category,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTask.id);

        if (error) throw error;
        toast.success("Task updated successfully");
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{
            title: taskForm.title,
            content: taskForm.content,
            category: taskForm.category,
            user_id: session.user.id,
            is_pinned: false,
            is_starred: false,
          }]);

        if (error) throw error;
        toast.success("Task created successfully");
      }

      queryClient.invalidateQueries({ 
        queryKey: ['tasks'],
        refetchType: 'all'
      });
      
      setTaskForm({ title: "", content: "", category: "personal" });
      setEditingTask(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(`Failed to ${editingTask ? 'update' : 'create'} task`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Edit task" : "Create a new task"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={taskForm.category}
              onValueChange={(value) =>
                setTaskForm((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.name.toLowerCase()}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${category.color}`}
                    ></span>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              value={taskForm.content}
              onChange={(e) =>
                setTaskForm((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Task description..."
              className="min-h-[120px]"
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveTask}>
            {editingTask ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
