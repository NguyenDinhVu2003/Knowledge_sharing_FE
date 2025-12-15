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
  views?: number;
  tags?: string[];
  group_ids?: number[];
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

export interface DocumentVersion {
  id: number;
  document_id: number;
  version_number: number;
  file_path: string;
  updated_by: string;
  updated_at: Date | string;
  change_notes: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
}
