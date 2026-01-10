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
  documentCount?: number;
  isInterested?: boolean; // Whether current user has this tag as interest
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  totalDocuments: number;
  totalFavorites: number;
  totalRatings: number;
  totalInterests: number;
  interests: Tag[];
}

export interface UpdateUserInterestsRequest {
  tagIds: number[];
}
