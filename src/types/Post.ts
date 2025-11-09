export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostData {
  posts: Post[];
  nextId: number;
}

export interface CreatePostInput {
  title: string;
  excerpt: string;
  content: string;
  author?: string;
}

export interface UpdatePostInput {
  title: string;
  excerpt: string;
  content: string;
  author: string;
}
