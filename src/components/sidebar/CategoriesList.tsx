
import React, { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { CategoryForm, COLORS } from "./CategoryForm";
import { CategoryItem } from "./CategoryItem";
import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface CategoriesListProps {
  categories: Category[];
  selectedCategory: string;
  onCreateCategory: (data: { name: string; color: string }) => Promise<void>;
  onUpdateCategory: (categoryId: string, data: { name: string; color: string }) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  collapsed: boolean;
}

export const CategoriesList = ({
  categories,
  selectedCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  collapsed,
}: CategoriesListProps) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    color: COLORS[0].value,
  });

  const handleCreateCategory = async () => {
    await onCreateCategory(categoryForm);
    setIsNewCategoryOpen(false);
    setCategoryForm({ name: "", color: COLORS[0].value });
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    await onUpdateCategory(editingCategory.id, categoryForm);
    setEditingCategory(null);
    setCategoryForm({ name: "", color: COLORS[0].value });
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      color: category.color,
    });
  };

  // If sidebar is collapsed, show only icons without the category section header
  if (collapsed) {
    return (
      <div className="mt-4 px-2">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.name.toLowerCase()}
            onEdit={openEditDialog}
            onDelete={onDeleteCategory}
            collapsed={collapsed}
          />
        ))}
        <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 mx-auto mt-2 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              formData={categoryForm}
              onChange={setCategoryForm}
              onSubmit={handleCreateCategory}
              submitLabel="Create Category"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog
          open={editingCategory !== null}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              formData={categoryForm}
              onChange={setCategoryForm}
              onSubmit={handleUpdateCategory}
              submitLabel="Update Category"
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="mt-6 px-2">
      <div className="flex items-center justify-between px-3 py-2 text-muted-foreground hover:text-foreground">
        <button
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          className="flex items-center gap-2"
        >
          {isCategoriesOpen ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
          <span className="font-medium">Categories</span>
        </button>
        <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <PlusIcon className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create new category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              formData={categoryForm}
              onChange={setCategoryForm}
              onSubmit={handleCreateCategory}
              submitLabel="Create Category"
            />
          </DialogContent>
        </Dialog>
      </div>
      {isCategoriesOpen && (
        <div className="mt-1">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isSelected={selectedCategory === category.name.toLowerCase()}
              onEdit={openEditDialog}
              onDelete={onDeleteCategory}
              collapsed={collapsed}
            />
          ))}
        </div>
      )}

      {/* Edit Category Dialog */}
      <Dialog
        open={editingCategory !== null}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={categoryForm}
            onChange={setCategoryForm}
            onSubmit={handleUpdateCategory}
            submitLabel="Update Category"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
