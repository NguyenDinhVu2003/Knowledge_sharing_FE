export interface Document {
  id: number;
  title: string;
  summary: string;
  file_path: string;
  file_type: string;
  file_size: number;
  owner_id: number;
  owner_name: string;
  sharing_level: string;
  created_at: Date | string;
  updated_at: Date | string;
  version_number: number;
  is_archived: boolean;
  average_rating?: number;
}

export interface DocumentCreateRequest {
  title: string;
  summary: string;
  file_path: string;
  file_type: string;
  sharing_level: string;
}

export interface DocumentUpdateRequest {
  title?: string;
  summary?: string;
  sharing_level?: string;
  is_archived?: boolean;
}
