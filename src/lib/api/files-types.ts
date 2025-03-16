
export interface UserFolder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserFile {
  id: string;
  name: string;
  folder_id: string | null;
  storage_path: string;
  file_type: string;
  file_size: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  url?: string; // Added optional url property for temporary URLs
}

export interface BreadcrumbItem {
  id: string | null;
  name: string;
}
