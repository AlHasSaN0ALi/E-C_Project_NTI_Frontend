export interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  product: string;
  rating: number;
  title?: string;
  comment: string;
  verified: boolean;
  isVerified: boolean;
  isLiked?: boolean;
  likes?: number;
  helpful: number;
  images?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  tags?: string[];
  images?: File[];
}

export interface ReviewResponse {
  success: boolean;
  message: string;
  data: Review;
}

export interface ReviewListResponse {
  success: boolean;
  data: Review[];
  total: number;
  page: number;
  limit: number;
}
