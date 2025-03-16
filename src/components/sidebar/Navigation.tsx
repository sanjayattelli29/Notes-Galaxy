
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FolderIcon, 
  StarIcon, 
  TrashIcon, 
  BarChart2, 
  Menu, 
  KanbanSquare,
  ChevronRight,
  FileIcon,
  Trash
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const mainNavItems = [
  { icon: FolderIcon, label: "Notes", path: "/" },
  { icon: KanbanSquare, label: "Tasks", path: "/tasks" },
  { icon: FileIcon, label: "Files", path: "/files" },
  { icon: StarIcon, label: "Starred", path: "/starred" },
  { icon: BarChart2, label: "Analysis", path: "/analysis" },
];

const trashNavItems = [
  { icon: TrashIcon, label: "Notes Trash", path: "/trash" },
  { icon: Trash, label: "Files Trash", path: "/file-trash" },
];

interface NavigationProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Navigation = ({ collapsed, onToggle }: NavigationProps) => {
  const location = useLocation();

  const renderNavItem = (item: { icon: any; label: string; path: string }, index: number) => {
    const isActive = 
      location.pathname === item.path || 
      (item.path === "/tasks" && location.pathname.includes("/tasks"));
        
    return (
      <Link
        key={index}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors relative",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-accent text-muted-foreground hover:text-foreground",
          collapsed && "justify-center p-2"
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className={cn(
          "w-5 h-5", 
          collapsed && "w-6 h-6",
          isActive && "text-primary"
        )} />
        {!collapsed && (
          <>
            <span>{item.label}</span>
            {isActive && (
              <ChevronRight className="w-4 h-4 ml-auto" />
            )}
          </>
        )}
        {isActive && collapsed && (
          <span className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-md"></span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-4 py-2">
        {!collapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            NotesGalaxy
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggle} 
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-primary",
            collapsed && "mx-auto"
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-col gap-1 px-2">
        {mainNavItems.map((item, index) => renderNavItem(item, index))}
      </div>
      
      {!collapsed && (
        <div className="px-0 py-0">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            
          </h2>
        </div>
      )}
      
      <div className="flex flex-col gap-1 px-2">
        {trashNavItems.map((item, index) => renderNavItem(item, index))}
      </div>
    </div>
  );
};
