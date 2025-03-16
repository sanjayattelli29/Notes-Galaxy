import { supabase } from "@/integrations/supabase/client";

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

export const isPreviewable = (fileType: string, url?: string): boolean => {
  return !!url && (
    fileType.startsWith('image/') || 
    fileType === 'application/pdf' || 
    fileType.startsWith('video/') ||
    fileType.startsWith('audio/')
  );
};

export const getFileType = (fileType: string) => {
  const isImage = fileType.startsWith('image/');
  const isVideo = fileType.startsWith('video/');
  const isAudio = fileType.startsWith('audio/');
  const isPdf = fileType === 'application/pdf';
  
  return { isImage, isVideo, isAudio, isPdf };
};

// Share via clipboard
export const shareViaLink = (url?: string, name?: string): boolean => {
  if (!url) return false;
  
  try {
    const shareText = name ? `${name}: ${url}` : url;
    navigator.clipboard.writeText(shareText);
    return true;
  } catch (error) {
    console.error("Error sharing link:", error);
    return false;
  }
};

// Get available folders
export const getAvailableFolders = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];
    
    const { data, error } = await supabase
      .from('user_folders')
      .select('id, name')
      .eq('user_id', session.user.id);
    
    if (error) {
      console.error("Error fetching folders:", error);
      return [];
    }
    
    return data.map(folder => ({ 
      id: folder.id, 
      name: folder.name 
    }));
  } catch (error) {
    console.error("Error getting available folders:", error);
    return [];
  }
};

// Add to starred (simulated for now)
export const addToStarred = async (id: string, name: string): Promise<boolean> => {
  try {
    console.log(`Adding ${name} (${id}) to starred items`);
    return true;
  } catch (error) {
    console.error("Error adding to starred:", error);
    return false;
  }
};

// Move file to folder - Implemented properly
export const moveToFolder = async (id: string, folderId: string, name: string): Promise<boolean> => {
  try {
    let isFile = true;
    
    let { error: fileError } = await supabase
      .from('user_files')
      .update({ folder_id: folderId })
      .eq('id', id);
    
    if (fileError) {
      isFile = false;
      const { error: folderError } = await supabase
        .from('user_folders')
        .update({ parent_id: folderId })
        .eq('id', id);
      
      if (folderError) {
        console.error("Error moving folder:", folderError);
        return false;
      }
    }
    
    console.log(`Moved ${isFile ? 'file' : 'folder'} ${name} (${id}) to folder ${folderId}`);
    return true;
  } catch (error) {
    console.error("Error moving item:", error);
    return false;
  }
};

// Add to new folder - Implemented properly
export const addToNewFolder = async (id: string, folderName: string, name: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    const { data: newFolder, error: folderError } = await supabase
      .from('user_folders')
      .insert([{
        name: folderName,
        user_id: session.user.id
      }])
      .select()
      .single();
    
    if (folderError || !newFolder) {
      console.error("Error creating folder:", folderError);
      return false;
    }
    
    const success = await moveToFolder(id, newFolder.id, name);
    return success;
  } catch (error) {
    console.error("Error adding to new folder:", error);
    return false;
  }
};
