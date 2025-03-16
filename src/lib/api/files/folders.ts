
import { supabase } from "@/integrations/supabase/client";
import { UserFolder } from "../files-types";

/**
 * Fetch user folders
 * @param parentId - Optional parent folder ID
 * @returns Array of folders
 */
export const getUserFolders = async (parentId: string | null = null): Promise<UserFolder[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const query = supabase
    .from('user_folders')
    .select('*')
    .eq('user_id', session.user.id)
    .order('name', { ascending: true });
  
  if (parentId) {
    query.eq('parent_id', parentId);
  } else {
    query.is('parent_id', null);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
  
  return data || [];
};

/**
 * Create a new folder
 * @param name - Folder name
 * @param parentId - Optional parent folder ID
 * @returns The created folder
 */
export const createFolder = async (name: string, parentId: string | null = null): Promise<UserFolder | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_folders')
    .insert([{
      name,
      parent_id: parentId,
      user_id: session.user.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating folder:', error);
    return null;
  }
  
  return data;
};

/**
 * Rename a folder
 * @param folderId - Folder ID to rename
 * @param newName - New folder name
 * @returns Boolean indicating success
 */
export const renameFolder = async (folderId: string, newName: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_folders')
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq('id', folderId);
  
  if (error) {
    console.error('Error renaming folder:', error);
    return false;
  }
  
  return true;
};

/**
 * Delete a folder
 * @param folderId - Folder ID to delete
 * @returns Boolean indicating success
 */
export const deleteFolder = async (folderId: string): Promise<boolean> => {
  // First, recursively delete all files in this folder and its subfolders
  await deleteAllFilesInFolder(folderId);
  
  // Then delete the folder itself
  const { error } = await supabase
    .from('user_folders')
    .delete()
    .eq('id', folderId);
  
  if (error) {
    console.error('Error deleting folder:', error);
    return false;
  }
  
  return true;
};

/**
 * Recursively delete all files in a folder and its subfolders
 * @param folderId - Folder ID
 */
const deleteAllFilesInFolder = async (folderId: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Get all files in this folder
  const { data: files } = await supabase
    .from('user_files')
    .select('id, storage_path')
    .eq('folder_id', folderId);
  
  // Mark all files as deleted instead of permanently deleting them
  if (files && files.length > 0) {
    for (const file of files) {
      await supabase
        .from('user_files')
        .update({ 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', file.id);
    }
  }
  
  // Get all subfolders
  const { data: subfolders } = await supabase
    .from('user_folders')
    .select('id')
    .eq('parent_id', folderId);
  
  // Recursively delete all files in subfolders
  if (subfolders && subfolders.length > 0) {
    for (const subfolder of subfolders) {
      await deleteAllFilesInFolder(subfolder.id);
    }
  }
};
