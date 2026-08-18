import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
}

export interface Document {
  id: string;
  title: string;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
  is_public: boolean;
  share_token: string;
}

export interface DocumentMember {
  document_id: string;
  user_id: string;
  role: 'editor' | 'viewer';
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}
