export interface Document {
  id: number;
  title: string;
  summary: string;
  file_path: string;
  file_type: string;
  owner_id: number;
  sharing_level: string;
  created_at: Date;
  updated_at: Date;
  version_number: number;
  is_archived: boolean;
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
