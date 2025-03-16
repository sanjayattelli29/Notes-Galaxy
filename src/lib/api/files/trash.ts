
import { supabase } from "@/integrations/supabase/client";
import { UserFile } from "../files-types";

/**
 * Fetch deleted (trashed) user files
 * @returns Array of deleted files
 */
export const getTrashedFiles = async (): Promise<UserFile[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('user_files')
    .select('*')
    .eq('user_id', session.user.id)
    .not('deleted_at', 'is', null) // Only get deleted files
    .order('deleted_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching trashed files:', error);
    return [];
  }
  
  // Generate temporary URLs for files
  const filesWithUrls: UserFile[] = [];
  
  if (data && data.length > 0) {
    for (const file of data) {
      const fileWithUrl: UserFile = {
        ...file,
        url: undefined // Initialize the optional property
      };
      
      const { data: urlData } = await supabase.storage
        .from('user_files')
        .createSignedUrl(`${session.user.id}/${file.storage_path}`, 3600);
      
      if (urlData) {
        fileWithUrl.url = urlData.signedUrl;
      }
      
      filesWithUrls.push(fileWithUrl);
    }
  }
  
  return filesWithUrls;
};

/**
 * Restore a file from trash
 * @param fileId - File ID to restore
 * @returns Boolean indicating success
 */
export const restoreFileFromTrash = async (fileId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_files')
    .update({ deleted_at: null })
    .eq('id', fileId);
  
  if (error) {
    console.error('Error restoring file from trash:', error);
    return false;
  }
  
  return true;
};

/**
 * Permanently delete a file
 * @param fileId - File ID to delete
 * @returns Boolean indicating success
 */
export const permanentlyDeleteFile = async (fileId: string): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  // Get file details
  const { data: file, error: fetchError } = await supabase
    .from('user_files')
    .select('storage_path')
    .eq('id', fileId)
    .eq('user_id', session.user.id)
    .single();
  
  if (fetchError || !file) {
    console.error('Error getting file details:', fetchError);
    return false;
  }
  
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('user_files')
    .remove([`${session.user.id}/${file.storage_path}`]);
  
  if (storageError) {
    console.error('Error deleting file from storage:', storageError);
    return false;
  }
  
  // Delete from database
  const { error } = await supabase
    .from('user_files')
    .delete()
    .eq('id', fileId);
  
  if (error) {
    console.error('Error deleting file record:', error);
    return false;
  }
  
  return true;
};

/**
 * Empty the trash (permanently delete all trashed files)
 * @returns Boolean indicating success
 */
export const emptyTrash = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  // Get all trashed files
  const { data: trashedFiles, error: fetchError } = await supabase
    .from('user_files')
    .select('id, storage_path')
    .eq('user_id', session.user.id)
    .not('deleted_at', 'is', null);
  
  if (fetchError) {
    console.error('Error fetching trashed files:', fetchError);
    return false;
  }
  
  if (!trashedFiles || trashedFiles.length === 0) {
    return true; // Nothing to delete
  }
  
  // Delete all files from storage
  for (const file of trashedFiles) {
    await supabase.storage
      .from('user_files')
      .remove([`${session.user.id}/${file.storage_path}`]);
  }
  
  // Delete all trashed files from database
  const { error } = await supabase
    .from('user_files')
    .delete()
    .eq('user_id', session.user.id)
    .not('deleted_at', 'is', null);
  
  if (error) {
    console.error('Error emptying trash:', error);
    return false;
  }
  
  return true;
};
