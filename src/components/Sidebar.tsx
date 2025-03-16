
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api/categories";
import type { Category } from "@/lib/api/types";
import { toast } from "sonner";
import { Navigation } from "./sidebar/Navigation";
import { CategoriesList } from "./sidebar/CategoriesList";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category')?.toLowerCase() || 'all';
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(() => {
    // Check localStorage for preference, default to false on desktop and true on mobile
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      return savedState === 'true';
    }
    return window.innerWidth < 768;
  });

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const handleCreateCategory = async (data: { name: string; color: string }) => {
    try {
      await createCategory(data.name, data.color);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category created successfully");
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error("Failed to create category");
    }
  };

  const handleUpdateCategory = async (categoryId: string, data: { name: string; color: string }) => {
    try {
      await updateCategory(categoryId, data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category updated successfully");
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <aside 
      className={cn(
        "bg-card border-r border-border h-screen transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <Navigation 
        collapsed={collapsed} 
        onToggle={toggleSidebar} 
      />
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <CategoriesList
          categories={categories}
          selectedCategory={selectedCategory}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          collapsed={collapsed}
        />
      </div>
      <div className={cn(
        "p-4 border-t border-border text-xs text-muted-foreground",
        collapsed && "text-center p-2"
      )}>
        {!collapsed ? (
          <div className="space-y-1">
          </div>
        ) : (
          <div className="text-center"></div>
        )}
      </div>
    </aside>
  );
};
