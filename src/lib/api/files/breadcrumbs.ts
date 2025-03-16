
import { supabase } from "@/integrations/supabase/client";
import { BreadcrumbItem } from "../files-types";

/**
 * Get folder breadcrumb path
 * @param folderId - Current folder ID
 * @returns Array of breadcrumb items
 */
export const getFolderBreadcrumb = async (folderId: string | null): Promise<BreadcrumbItem[]> => {
  const breadcrumbs: BreadcrumbItem[] = [{ id: null, name: 'My Files' }];
  
  if (!folderId) return breadcrumbs;
  
  let currentFolderId = folderId;
  
  while (currentFolderId) {
    const { data, error } = await supabase
      .from('user_folders')
      .select('id, name, parent_id')
      .eq('id', currentFolderId)
      .single();
    
    if (error || !data) break;
    
    breadcrumbs.push({ id: data.id, name: data.name });
    
    if (data.parent_id) {
      currentFolderId = data.parent_id;
    } else {
      break;
    }
  }
  
  return breadcrumbs.reverse();
};
