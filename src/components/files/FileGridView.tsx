
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileIcon } from './FileIcon';
import { formatFileSize, isPreviewable } from './FileUtils';
import { getFileType } from './FileUtils';
import { Play } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface FileGridViewProps {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
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

export const FileGridView: React.FC<FileGridViewProps> = ({
  id,
  name,
  type,
  size,
  url,
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
  const { isImage, isVideo } = getFileType(type);

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-all group ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div className="relative">
        {/* Selection Checkbox */}
        {selectionMode && onToggleSelect && (
          <div className="absolute top-1 left-1 z-20">
            <Checkbox 
              checked={isSelected} 
              onCheckedChange={onToggleSelect}
              id={`file-select-${id}`}
              className="bg-white/90 shadow-sm"
            />
          </div>
        )}
        
        {/* File Preview */}
        <div className="h-20 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
          {isImage && url ? (
            <img src={url} alt={name} className="h-full w-full object-contain" onClick={onPreview} />
          ) : isVideo && url ? (
            <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
              <video src={url} className="max-h-full max-w-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="opacity-80"
                  onClick={onPreview}
                >
                  <Play className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-2">
              <FileIcon fileType={type} viewMode="grid" />
              <span className="mt-1 text-xs text-center truncate max-w-full px-1">{name}</span>
            </div>
          )}
          
          {/* Actions menu in the top-right corner */}
          <div className="absolute top-1 right-1 z-10">
            <div className="rounded-full bg-[#0e1423] dark:bg-[#0e1423]/80 shadow-md">
              {actionsMenu}
            </div>
          </div>
        </div>
        
        {/* File Info */}
        <CardContent className="p-1">
          <div className="flex items-center justify-between">
            <div className="truncate flex-1 mr-1">
              <p className="text-xs font-medium truncate" title={name}>{name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
