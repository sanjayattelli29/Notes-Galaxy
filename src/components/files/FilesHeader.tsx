
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, Upload, RefreshCw, ChevronDown, Menu } from 'lucide-react';
import { BreadcrumbItem } from '@/lib/api/files-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FilesHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  onCreateFolder: () => void;
  onUploadFile: () => void;
  onNavigate: (folderId: string | null) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const FilesHeader: React.FC<FilesHeaderProps> = ({
  breadcrumbs,
  onCreateFolder,
  onUploadFile,
  onNavigate,
  onRefresh,
  isLoading
}) => {
  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl md:text-4xl font-bold">Files</h1>
        
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button 
            onClick={onRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onCreateFolder} variant="outline" size="sm">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={onUploadFile} variant="default" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload File
          </Button>
        </div>
        
        {/* Mobile dropdown menu */}
        <div className="flex md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4 mr-2" />
                Actions
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRefresh} disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateFolder}>
                <FolderPlus className="w-4 h-4 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onUploadFile}>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Breadcrumbs */}
      <nav className="flex overflow-x-auto" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 whitespace-nowrap">
          {breadcrumbs.map((item, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">/</span>}
              <button
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-medium hover:text-primary ${
                  index === breadcrumbs.length - 1
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};
