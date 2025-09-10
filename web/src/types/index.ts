// User types
export interface User {
  _id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
}

// Folder types
export interface Folder {
  _id: string;
  name: string;
  type: 'system' | 'user';
  userId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Note types
export interface Note {
  _id: string;
  title: string;
  content: TiptapContent;
  folderId: string;
  userId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// TipTap content type
export interface TiptapContent {
  type: 'doc';
  content?: Array<{
    type: string;
    attrs?: Record<string, unknown>;
    content?: Array<{
      type: string;
      text?: string;
      attrs?: Record<string, unknown>;
    }>;
  }>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, unknown>;
}

