export interface EsaPost {
  number: number;
  name: string;
  full_name: string;
  wip: boolean;
  body_md: string;
  message?: string;
  url: string;
  created_at: string;
  updated_at: string;
  category?: string | null;
  tags: string[];
}

export interface EsaListPostsResponse {
  posts: EsaPost[];
  prev_page: number | null;
  next_page: number | null;
  total_count: number;
  page: number;
  per_page: number;
  max_per_page: number;
}

export interface EsaGetMembersResponse {
  members: EsaMember[];
  prev_page: number | null;
  next_page: number | null;
  total_count: number;
  page: number;
  per_page: number;
  max_per_page: number;
}

export interface EsaMember {
  name: string;
  screen_name: string;
  icon: string;
  email?: string | null;
}

export interface EsaCreatePostPayload {
  name: string;
  body_md: string;
  category?: string;
  tags?: string[];
  wip?: boolean;
  message?: string;
}

export interface EsaUpdatePostPayload {
  name?: string;
  body_md?: string;
  category?: string;
  tags?: string[];
  wip?: boolean;
  message?: string;
}

export interface EsaListPostParams {
  q?: string;
  per_page?: number;
  page?: number;
}
