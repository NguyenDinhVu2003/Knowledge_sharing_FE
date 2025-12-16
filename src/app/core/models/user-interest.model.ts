export interface UserInterest {
  id: number;
  userId: number;
  tagId: number;
  tagName: string;
  createdAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  description?: string;
  documentCount?: number; // Number of documents with this tag
}
