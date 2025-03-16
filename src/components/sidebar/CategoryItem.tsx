
import React from "react";
import { Link } from "react-router-dom";
import { PencilIcon, TrashIcon } from "lucide-react";
import { Button } from "../ui/button";
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
} from "../ui/alert-dialog";
import type { Category } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  collapsed?: boolean;
}

export const CategoryItem = ({
  category,
  isSelected,
  onEdit,
  onDelete,
  collapsed = false,
}: CategoryItemProps) => {
  if (collapsed) {
    return (
      <div className="relative group my-1">
        <Link
          to={`/?category=${category.name.toLowerCase()}`}
          className={cn(
            "flex items-center justify-center p-2 rounded-md w-10 h-10 mx-auto",
            isSelected
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
          title={category.name}
        >
          <span className={`w-3 h-3 rounded-full ${category.color}`} />
        </Link>
        <div className="absolute right-0 top-0 hidden group-hover:flex flex-col gap-1 bg-card rounded-md shadow-lg p-1 -mr-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              onEdit(category);
            }}
          >
            <PencilIcon className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive"
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this category? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(category.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center justify-between px-3 py-2 rounded-md text-sm ${
        isSelected
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      <Link
        to={`/?category=${category.name.toLowerCase()}`}
        className="flex items-center gap-2 flex-1"
      >
        <span className={`w-2 h-2 rounded-full ${category.color}`} />
        <span>{category.name}</span>
      </Link>
      <div className="hidden group-hover:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.preventDefault();
            onEdit(category);
          }}
        >
          <PencilIcon className="h-3 w-3" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:text-destructive"
            >
              <TrashIcon className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this category? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(category.id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
