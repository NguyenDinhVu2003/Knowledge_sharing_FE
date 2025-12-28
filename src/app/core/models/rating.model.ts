export interface Rating {
  id: number;
  documentId: number;
  documentTitle: string;
  userId: number;
  username: string;
  ratingValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface RatingStats {
  documentId: number;
  averageRating: number;
  totalRatings: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

export interface RatingRequest {
  ratingValue: number;
}
