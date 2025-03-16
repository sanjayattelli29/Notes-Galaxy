
import React from 'react';
import { FileText, FileImage, FileCode, FileArchive, FileAudio, FileVideo } from 'lucide-react';

interface FileIconProps {
  fileType: string;
  viewMode: 'grid' | 'list';
}

export const FileIcon: React.FC<FileIconProps> = ({ fileType, viewMode }) => {
  const iconSize = viewMode === 'grid' ? 'h-6 w-6' : 'h-4 w-4';
  
  if (fileType.startsWith('image/')) {
    return <FileImage className={`${iconSize} text-blue-500`} />;
  } else if (fileType === 'application/pdf') {
    return <FileText className={`${iconSize} text-red-500`} />;
  } else if (fileType.startsWith('audio/')) {
    return <FileAudio className={`${iconSize} text-green-500`} />;
  } else if (fileType.startsWith('video/')) {
    return <FileVideo className={`${iconSize} text-purple-500`} />;
  } else if (fileType.startsWith('text/') || fileType.includes('javascript') || fileType.includes('json')) {
    return <FileCode className={`${iconSize} text-yellow-500`} />;
  } else if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) {
    return <FileArchive className={`${iconSize} text-orange-500`} />;
  } else {
    return <FileText className={`${iconSize} text-gray-500`} />;
  }
};
