export type TBlog = {
  title: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  readTime: number; // in minutes
  publishDate: Date;
  slug: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  isDeleted: boolean;
  views: number;
  likes: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TBlogFilters = {
  searchTerm?: string;
  category?: string;
  tags?: string;
  status?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};
