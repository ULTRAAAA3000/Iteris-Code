// Типи середовища Cloudflare Pages Functions
export interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  SESSION_SECRET?: string;
}

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  is_pro: number;
  pro_until: string | null;
  streak_count: number;
  last_active_at: string | null;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isPro: boolean;
  proUntil: string | null;
  streak: number;
}
