// src/types/moments.ts

export type Moment = {
  id: string;
  title: string;
  flow_id: string;
  content?: string
  created_at: string;
  updated_at: string
  snippet?: string
  author?: MomentAuthor
  type?: 'personal' | 'shared' | 'couple';
};

export interface MomentAuthor {
	user_id: string;
	username: string;
	email: string;
	avatar_url?: string;
}