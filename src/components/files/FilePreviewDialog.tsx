
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download, Link } from 'lucide-react';
import { FileIcon } from './FileIcon';
import { getFileType } from './FileUtils';

interface FilePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  type: string;
  url?: string;
  onDownload: () => void;
  onCopyLink: () => void;
}

export const FilePreviewDialog: React.FC<FilePreviewDialogProps> = ({
  isOpen,
  onOpenChange,
  name,
  type,
  url,
  onDownload,
  onCopyLink,
}) => {
  const { isImage, isVideo, isAudio, isPdf } = getFileType(type);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileIcon fileType={type} viewMode="list" />
            <span className="ml-2">{name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 flex justify-center">
          {isImage && url && (
            <img src={url} alt={name} className="max-h-[60vh] max-w-full object-contain" />
          )}
          {isVideo && url && (
            <video src={url} controls className="max-h-[60vh] max-w-full" />
          )}
          {isAudio && url && (
            <audio src={url} controls className="w-full" />
          )}
          {isPdf && url && (
            <iframe src={url} className="w-full h-[60vh]" title={name} />
          )}
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="outline" onClick={onDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          {url && (
            <Button variant="outline" onClick={onCopyLink}>
              <Link className="h-4 w-4 mr-2" />
              Copy link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
