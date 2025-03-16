
import React, { useState, useEffect } from 'react';
import { FileGridView } from './FileGridView';
import { FileListView } from './FileListView';
import { FilePreviewDialog } from './FilePreviewDialog';
import { FileInfoDialog } from './FileInfoDialog';
import { FileDeleteAlert } from './FileDeleteAlert';
import { isPreviewable, shareViaLink, addToStarred, moveToFolder, addToNewFolder, getAvailableFolders } from './FileUtils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Eye,
  Download,
  Trash,
  Link2,
  Info,
  Share2,
  Star,
  FolderPlus,
  Move,
  Loader2
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { 
  ContextMenu,
  ContextMenuContent, 
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FolderOption {
  id: string;
  name: string;
}

interface FileItemProps {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  created_at: string;
  updated_at: string;
  viewMode: 'grid' | 'list';
  onDownload: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode?: boolean;
}

export const FileItem: React.FC<FileItemProps> = ({
  id,
  name,
  type,
  size,
  url,
  created_at,
  updated_at,
  viewMode,
  onDownload,
  onDelete,
  isSelected = false,
  onToggleSelect,
  selectionMode = false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState("");
  const [availableFolders, setAvailableFolders] = useState<FolderOption[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  
  const canPreview = isPreviewable(type, url);

  // Fetch available folders when needed
  useEffect(() => {
    if (isMoveDialogOpen) {
      fetchAvailableFolders();
    }
  }, [isMoveDialogOpen]);

  const fetchAvailableFolders = async () => {
    setIsLoadingFolders(true);
    const folders = await getAvailableFolders();
    setAvailableFolders(folders);
    setIsLoadingFolders(false);
  };

  // Copy link to clipboard
  const copyLink = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  // Share file via link
  const handleShare = () => {
    if (shareViaLink(url, name)) {
      toast.success("Link copied to clipboard");
      setIsSharePopoverOpen(false);
    } else {
      toast.error("Failed to copy link");
    }
  };

  // Add to starred/favorites
  const handleAddToStarred = async () => {
    const success = await addToStarred(id, name);
    if (success) {
      toast.success(`Added ${name} to starred items`);
    } else {
      toast.error("Failed to add to starred items");
    }
  };

  // Handle move to folder
  const handleMoveToFolder = async () => {
    if (!selectedFolderId) {
      toast.error("Please select a folder");
      return;
    }
    
    const selectedFolder = availableFolders.find(f => f.id === selectedFolderId);
    if (!selectedFolder) return;
    
    const success = await moveToFolder(id, selectedFolderId, name);
    if (success) {
      toast.success(`Moved ${name} to ${selectedFolder.name}`);
      setIsMoveDialogOpen(false);
      
      // Force refresh of the files/folders list after moving
      window.location.reload();
    } else {
      toast.error("Failed to move file");
    }
  };

  // Handle add to new folder
  const handleAddToNewFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    const success = await addToNewFolder(id, newFolderName, name);
    if (success) {
      toast.success(`Created folder ${newFolderName} and moved ${name} to it`);
      setIsNewFolderDialogOpen(false);
      setNewFolderName("");
      
      // Force refresh of the files/folders list after moving
      window.location.reload();
    } else {
      toast.error("Failed to create folder");
    }
  };

  // Handler functions
  const handlePreview = () => setIsPreviewOpen(true);
  const handleShowInfo = () => setIsInfoOpen(true);
  const handleDownload = () => onDownload(id, name);
  const handleDelete = () => onDelete(id);

  // Actions menu for both view modes
  const renderActionsMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full text-white">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">More options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {canPreview && (
          <DropdownMenuItem onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setIsSharePopoverOpen(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={copyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copy link
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleAddToStarred}>
          <Star className="h-4 w-4 mr-2" />
          Add to starred
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setIsMoveDialogOpen(true)}>
          <Move className="h-4 w-4 mr-2" />
          Move to folder
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => setIsNewFolderDialogOpen(true)}>
          <FolderPlus className="h-4 w-4 mr-2" />
          Add to new folder
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleShowInfo}>
          <Info className="h-4 w-4 mr-2" />
          File info
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive" 
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Context menu for right-click actions
  const renderContextMenu = () => (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full block">
        {viewMode === 'grid' ? (
          <FileGridView
            id={id}
            name={name}
            type={type}
            size={size}
            url={url}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onShowInfo={handleShowInfo}
            onCopyLink={copyLink}
            actionsMenu={renderActionsMenu()}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
            selectionMode={selectionMode}
          />
        ) : (
          <FileListView
            id={id}
            name={name}
            type={type}
            size={size}
            url={url}
            updated_at={updated_at}
            onPreview={handlePreview}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onShowInfo={handleShowInfo}
            onCopyLink={copyLink}
            actionsMenu={renderActionsMenu()}
            isSelected={isSelected}
            onToggleSelect={onToggleSelect}
            selectionMode={selectionMode}
          />
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[200px]">
        {canPreview && (
          <ContextMenuItem onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </ContextMenuItem>
        )}
        
        <ContextMenuItem onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => setIsSharePopoverOpen(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </ContextMenuItem>
        
        <ContextMenuItem onClick={copyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copy link
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleShowInfo}>
          <Info className="h-4 w-4 mr-2" />
          File info
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem 
          className="text-destructive focus:text-destructive" 
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  return (
    <>
      {renderContextMenu()}
      
      {/* Share Popover */}
      <Popover open={isSharePopoverOpen} onOpenChange={setIsSharePopoverOpen}>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h3 className="font-medium">Share "{name}"</h3>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                className="flex-1" 
                onClick={handleShare}
              >
                <Link2 className="h-4 w-4 mr-2" />
                Copy link
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsSharePopoverOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Move to Folder Dialog */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move file to folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoadingFolders ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : availableFolders.length > 0 ? (
              <RadioGroup value={selectedFolderId} onValueChange={setSelectedFolderId}>
                {availableFolders.map((folder) => (
                  <div key={folder.id} className="flex items-center space-x-2 mb-2 p-2 border rounded-md">
                    <RadioGroupItem value={folder.id} id={folder.id} />
                    <Label htmlFor={folder.id}>{folder.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Alert>
                <AlertDescription>No folders available. Create a new folder first.</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveToFolder} disabled={!selectedFolderId || availableFolders.length === 0}>
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add to New Folder Dialog */}
      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create new folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-folder-name">Folder name</Label>
            <Input
              id="new-folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToNewFolder} disabled={!newFolderName.trim()}>
              Create and Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <FilePreviewDialog
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        name={name}
        type={type}
        url={url}
        onDownload={handleDownload}
        onCopyLink={copyLink}
      />
      
      {/* File Info Dialog */}
      <FileInfoDialog
        isOpen={isInfoOpen}
        onOpenChange={setIsInfoOpen}
        name={name}
        type={type}
        size={size}
        created_at={created_at}
        updated_at={updated_at}
      />
    </>
  );
};
