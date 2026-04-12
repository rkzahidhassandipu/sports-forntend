// src/types/blog.ts

import { User } from "./user";


export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  authorId: string;
  published: boolean;
  publishedAt?: string | null;
  tags: string[];
  viewCount: number;
  readTime?: number | null;
  createdAt: string;
  updatedAt: string;
  author?: User; // Optional relation
}

export interface CreateBlogDto {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  published?: boolean;
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> {}

export interface BlogFilters {
  page?: number;
  limit?: number;
  published?: boolean;
  tag?: string;
  authorId?: string;
}
