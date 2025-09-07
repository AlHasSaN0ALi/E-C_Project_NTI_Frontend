export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  avatar?: string;
  phone?: string;
  lastLogin?: Date;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
}
