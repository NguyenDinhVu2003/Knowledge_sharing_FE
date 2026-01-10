export interface UserManagement {
  id: number;
  username: string;
  email: string;
  role: 'EMPLOYEE' | 'ADMIN';
  documentCount: number;
  ratingCount: number;
  favoriteCount: number;
  createdAt: string;  // ISO date string
  lastActivity: string;  // ISO date string
}

export interface SystemStatistics {
  // User statistics
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  
  // Document statistics
  totalDocuments: number;
  documentsThisMonth: number;
  documentsByType: { [key: string]: number };
  documentsBySharingLevel: { [key: string]: number };
  
  // Engagement statistics
  totalRatings: number;
  averageRating: number;
  totalFavorites: number;
  totalNotifications: number;
  
  // Tag and Group statistics
  totalTags: number;
  totalGroups: number;
  
  // Top performers
  topTags: { [key: string]: number };
  topContributors: { [key: string]: number };
  topRatedDocuments: { [key: string]: number };
}

export interface UpdateUserRoleRequest {
  role: 'EMPLOYEE' | 'ADMIN';
}
