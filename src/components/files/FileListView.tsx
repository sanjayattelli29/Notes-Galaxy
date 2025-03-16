
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileIcon } from './FileIcon';
import { formatFileSize, isPreviewable } from './FileUtils';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

interface FileListViewProps {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  updated_at: string;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onShowInfo: () => void;
  onCopyLink: () => void;
  actionsMenu: React.ReactNode;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  selectionMode?: boolean;
}

export const FileListView: React.FC<FileListViewProps> = ({
  id,
  name,
  type,
  size,
  url,
  updated_at,
  onPreview,
  onDownload,
  onDelete,
  onShowInfo,
  onCopyLink,
  actionsMenu,
  isSelected = false,
  onToggleSelect,
  selectionMode = false,
}) => {
  const canPreview = isPreviewable(type, url);
  
  return (
    <div className="flex items-center justify-between p-2 border-b hover:bg-accent/50 transition-colors rounded-md group">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {selectionMode && onToggleSelect && (
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onToggleSelect}
            className="mr-1"
            id={`file-select-${id}`}
          />
        )}
        <FileIcon fileType={type} viewMode="list" />
        <div className="truncate min-w-0 flex-1">
          <p className="text-sm font-medium truncate" title={name}>{name}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(updated_at), 'MMM d, yyyy')} • {formatFileSize(size)}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0 ml-2 z-10">
        <div className="rounded-full bg-[#0e1423] dark:bg-[#0e1423]/80">
          {actionsMenu}
        </div>
      </div>
    </div>
  );
};
