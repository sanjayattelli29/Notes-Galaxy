
import { supabase } from "@/integrations/supabase/client";

/**
 * Extracts the file name from a Supabase storage URL
 * @param url The full Supabase storage URL
 * @returns The file name extracted from the URL
 */
export const extractFileNameFromUrl = (url: string): string | null => {
  try {
    // Remove query parameters if any
    const urlWithoutParams = url.split('?')[0];
    
    // Get the last part of the URL path which should be the file name
    const parts = urlWithoutParams.split('/');
    return parts[parts.length - 1];
  } catch (error) {
    console.error("Error extracting file name from URL:", error);
    return null;
  }
};

/**
 * Determines the bucket name from a storage URL
 * @param url The full Supabase storage URL
 * @returns The bucket name
 */
export const getBucketFromUrl = (url: string): string => {
  if (url.includes('/avatars/')) {
    return 'avatars';
  } else if (url.includes('/notes-images/')) {
    return 'notes-images';
  }
  return 'notes'; // default bucket
};

/**
 * Deletes an image from Supabase storage
 * @param imageUrl The URL of the image to delete
 * @returns Promise that resolves when the image is deleted
 */
export const deleteImageFromStorage = async (imageUrl: string | null): Promise<void> => {
  if (!imageUrl) return;
  
  try {
    // Handle multiple image URLs (comma-separated)
    if (imageUrl.includes(',')) {
      const urls = imageUrl.split(',').map(url => url.trim());
      const deletePromises = urls.map(url => deleteImageFromStorage(url));
      await Promise.all(deletePromises);
      return;
    }
    
    const fileName = extractFileNameFromUrl(imageUrl);
    if (!fileName) {
      console.error("Could not extract filename from URL:", imageUrl);
      return;
    }
    
    // Determine the bucket based on the URL
    const bucket = getBucketFromUrl(imageUrl);
    
    console.log(`Deleting file ${fileName} from bucket ${bucket}`);
    
    // Delete the file from storage
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) {
      console.error(`Error deleting file ${fileName} from ${bucket}:`, error);
    } else {
      console.log(`Successfully deleted file ${fileName} from ${bucket}`);
    }
  } catch (error) {
    console.error("Error in deleteImageFromStorage:", error);
  }
};
