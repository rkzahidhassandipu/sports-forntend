// // src/services/blog.service.ts
// import { api } from '@/lib/api';
// import { BlogFilters, BlogPost, CreateBlogDto, UpdateBlogDto } from '@/types/blog';

// const BlogService = {
//   // GET /blog?page=1&limit=10&published=true ...
//   async getPosts(params?: BlogFilters): Promise<{ data: BlogPost[]; meta: any }> {
//     const { data } = await api.get('/blog', { params });
//     return data;
//   },

//   // GET /blog/search?q=...
//   async searchPosts(query: string): Promise<BlogPost[]> {
//     const { data } = await api.get('/blog/search', { params: { q: query } });
//     return data;
//   },

//   // GET /blog/:slug  — backend uses /:slug for single post fetch (works with ID too)
//   async getPost(slugOrId: string): Promise<{ data: BlogPost }> {
//     const { data } = await api.get(`/blog/${slugOrId}`);
//     return data;
//   },

//   // POST /blog
//   async createPost(payload: CreateBlogDto): Promise<BlogPost> {
//     const { data } = await api.post('/blog', payload);
//     return data;
//   },

//   // PUT /blog/:id
//   async updatePost(id: string, payload: UpdateBlogDto): Promise<BlogPost> {
//     const { data } = await api.put(`/blog/${id}`, payload);
//     return data;
//   },

//   // PATCH /blog/:id/publish
//   async publish(id: string): Promise<void> {
//     await api.patch(`/blog/${id}/publish`);
//   },

//   // PATCH /blog/:id/unpublish
//   async unpublish(id: string): Promise<void> {
//     await api.patch(`/blog/${id}/unpublish`);
//   },

//   // DELETE /blog/:id
//   async deletePost(id: string): Promise<void> {
//     await api.delete(`/blog/${id}`);
//   },
// };

// export default BlogService;


// src/services/blog.service.ts
import { api } from '@/lib/api';
import { BlogFilters, BlogPost, CreateBlogDto, UpdateBlogDto } from '@/types/blog';

/**
 * Axios bug fix: Axios by default skips params with `false` value.
 * `published: false` → URL এ আসে না → backend এ undefined হয় → সব posts আসে।
 *
 * Solution: boolean কে explicitly string এ convert করো।
 * `false` → "false", `true` → "true", `undefined` → key টাই skip (ALL tab)
 */
function serializeParams(params?: BlogFilters): Record<string, any> | undefined {
  if (!params) return undefined;

  const result: Record<string, any> = { ...params };

  if (typeof result.published === 'boolean') {
    result.published = result.published ? 'true' : 'false';
  }

  return result;
}

const BlogService = {
  // GET /blog?page=1&limit=10&published=true|false&search=...
  async getPosts(params?: BlogFilters): Promise<{ data: BlogPost[]; meta: any }> {
    const { data } = await api.get('/blog', { params: serializeParams(params) });
    return data;
  },

  // GET /blog/search?q=...
  async searchPosts(query: string): Promise<BlogPost[]> {
    const { data } = await api.get('/blog/search', { params: { q: query } });
    return data;
  },

  // GET /blog/:slugOrId
  async getPost(slugOrId: string): Promise<{ data: BlogPost }> {
    const { data } = await api.get(`/blog/${slugOrId}`);
    return data;
  },

  // POST /blog
  async createPost(payload: CreateBlogDto): Promise<BlogPost> {
    const { data } = await api.post('/blog', payload);
    return data;
  },

  // PUT /blog/:id
  async updatePost(id: string, payload: UpdateBlogDto): Promise<BlogPost> {
    const { data } = await api.put(`/blog/${id}`, payload);
    return data;
  },

  // PATCH /blog/:id/publish
  async publish(id: string): Promise<void> {
    await api.patch(`/blog/${id}/publish`);
  },

  // PATCH /blog/:id/unpublish
  async unpublish(id: string): Promise<void> {
    await api.patch(`/blog/${id}/unpublish`);
  },

  // DELETE /blog/:id
  async deletePost(id: string): Promise<void> {
    await api.delete(`/blog/${id}`);
  },
};

export default BlogService;