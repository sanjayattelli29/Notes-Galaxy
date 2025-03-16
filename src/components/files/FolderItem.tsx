
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileDeleteAlert } from './FileDeleteAlert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FolderItemProps {
  id: string;
  name: string;
  viewMode: 'grid' | 'list';
  onNavigate: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode?: boolean;
}

export const FolderItem = ({ 
  id, 
  name, 
  viewMode, 
  onNavigate, 
  onRename, 
  onDelete,
  isSelected = false,
  onToggleSelect,
  selectionMode = false
}: FolderItemProps) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [newName, setNewName] = useState(name);

  const handleRename = () => {
    if (newName.trim() && newName !== name) {
      onRename(id, newName);
    }
    setIsRenameOpen(false);
  };

  const handleNavigateToFolder = () => {
    if (!selectionMode) {
      onNavigate(id);
    }
  };

  const renderActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 rounded-full bg-[#0e1423]/80 text-white absolute right-1 top-1 opacity-80 hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => {
          setNewName(name);
          setIsRenameOpen(true);
        }}>
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <FileDeleteAlert 
          onDelete={() => onDelete(id)}
          title="Delete folder?"
          description="This will permanently delete the folder and all its contents. This action cannot be undone."
        >
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive" 
            onSelect={(e) => e.preventDefault()}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </FileDeleteAlert>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === 'grid') {
    return (
      <>
        <Card 
          className={cn(
            "h-20 w-full overflow-hidden hover:shadow-md transition-all cursor-pointer relative group",
            isSelected && "ring-2 ring-primary"
          )}
          onClick={selectionMode && onToggleSelect ? onToggleSelect : handleNavigateToFolder}
        >
          {selectionMode && onToggleSelect && (
            <div className="absolute top-1 left-1 z-20">
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={onToggleSelect}
                id={`folder-select-${id}`}
                className="bg-white/90 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          <div className="flex items-center justify-center h-12 mt-1">
            <Folder className="h-8 w-8 text-blue-500" />
            {renderActionsMenu()}
          </div>
          <CardContent className="p-1 pt-0">
            <p className="text-xs font-medium truncate text-center">{name}</p>
          </CardContent>
        </Card>

        <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Folder</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRename}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <div 
        className={cn(
          "flex items-center space-x-2 group w-full cursor-pointer",
          isSelected && "bg-accent/30 rounded-md"
        )}
        onClick={selectionMode && onToggleSelect ? onToggleSelect : handleNavigateToFolder}
      >
        {selectionMode && onToggleSelect && (
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onToggleSelect}
            id={`folder-select-${id}`}
            className="mr-1"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <Folder className="h-5 w-5 text-blue-500" />
        <span className="font-medium truncate">{name}</span>
        <div className="ml-auto">
          {renderActionsMenu()}
        </div>
      </div>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
