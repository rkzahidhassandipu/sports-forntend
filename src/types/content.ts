// src/types/content.ts

export interface StaticContent {
  id: string;
  key: string;      // The unique identifier used in URLs (e.g., 'terms')
  title: string;    // The display title
  content: string;  // The actual body (usually Markdown or HTML)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentDto {
  key: string;
  title: string;
  content: string;
  isActive?: boolean;
}

export interface UpdateContentDto extends Partial<Omit<CreateContentDto, 'key'>> {}