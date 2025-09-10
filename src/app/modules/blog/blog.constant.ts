export const BlogSearchableFields = ["title", "content", "excerpt", "tags", "category", "author.name"];

export const BlogFilterableFields = [
  "searchTerm",
  "category", 
  "tags",
  "status",
  "author",
  "dateFrom",
  "dateTo"
];

export const BlogSortableFields = [
  "title",
  "publishDate", 
  "views",
  "likes",
  "createdAt",
  "updatedAt"
];

export const BlogStatus = {
  DRAFT: "draft",
  PUBLISHED: "published", 
  ARCHIVED: "archived"
} as const;
