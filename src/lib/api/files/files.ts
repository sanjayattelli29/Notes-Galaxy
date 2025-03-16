
import { supabase } from "@/integrations/supabase/client";
import { UserFile } from "../files-types";

/**
 * Fetch user files in a folder
 * @param folderId - Optional folder ID
 * @returns Array of files
 */
export const getUserFiles = async (folderId: string | null = null): Promise<UserFile[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const query = supabase
    .from('user_files')
    .select('*')
    .eq('user_id', session.user.id)
    .is('deleted_at', null) // Only get non-deleted files
    .order('name', { ascending: true });
  
  if (folderId) {
    query.eq('folder_id', folderId);
  } else {
    query.is('folder_id', null);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching files:', error);
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
 * Upload a file
 * @param file - File to upload
 * @param folderId - Optional folder ID
 * @returns The created file metadata
 */
export const uploadFile = async (file: File, folderId: string | null = null): Promise<UserFile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Generate a unique file path
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop() || '';
  const fileName = file.name.replace(`.${fileExt}`, '');
  const filePath = `${timestamp}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;
  
  // Upload file to storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('user_files')
    .upload(`${session.user.id}/${filePath}`, file);
  
  if (storageError) {
    console.error('Error uploading file:', storageError);
    return null;
  }
  
  // Create file metadata record
  const { data, error } = await supabase
    .from('user_files')
    .insert([{
      name: file.name,
      folder_id: folderId,
      storage_path: filePath,
      file_type: file.type || 'application/octet-stream',
      file_size: file.size,
      user_id: session.user.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating file record:', error);
    // Clean up the uploaded file
    await supabase.storage
      .from('user_files')
      .remove([`${session.user.id}/${filePath}`]);
    return null;
  }
  
  // Create a proper UserFile object with the optional url property
  const userFile: UserFile = {
    ...data,
    url: undefined
  };
  
  // Generate temporary URL
  const { data: urlData } = await supabase.storage
    .from('user_files')
    .createSignedUrl(`${session.user.id}/${filePath}`, 3600);
  
  if (urlData) {
    userFile.url = urlData.signedUrl;
  }
  
  return userFile;
};

/**
 * Download a file
 * @param fileId - File ID to download
 * @returns Download URL
 */
export const getFileDownloadUrl = async (fileId: string): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Get file details
  const { data: file, error } = await supabase
    .from('user_files')
    .select('storage_path')
    .eq('id', fileId)
    .eq('user_id', session.user.id)
    .single();
  
  if (error || !file) {
    console.error('Error getting file details:', error);
    return null;
  }
  
  // Generate download URL
  const { data } = await supabase.storage
    .from('user_files')
    .createSignedUrl(`${session.user.id}/${file.storage_path}`, 3600, {
      download: true
    });
  
  return data?.signedUrl || null;
};

/**
 * Move a file to trash
 * @param fileId - File ID to move to trash
 * @returns Boolean indicating success
 */
export const moveFileToTrash = async (fileId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('user_files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', fileId);
  
  if (error) {
    console.error('Error moving file to trash:', error);
    return false;
  }
  
  return true;
};

/**
 * Delete a file
 * @param fileId - File ID to delete (move to trash)
 * @returns Boolean indicating success
 */
export const deleteFile = async (fileId: string): Promise<boolean> => {
  return await moveFileToTrash(fileId);
};
