# Blog API Documentation

## Overview
This document describes the comprehensive Blog API endpoints for both admin and public access. The API supports full CRUD operations, advanced filtering, pagination, and professional blog management features.

## Base URL
```
/api/v1/blogs
```

## Authentication
- Admin routes require authentication via `adminAuth()` middleware
- Public routes are accessible without authentication

---

## Admin Endpoints (Protected)

### 1. Create Blog
**POST** `/admin/create`

Create a new blog post.

**Request Body:**
```json
{
  "title": "Blog Title",
  "content": "Full blog content...",
  "excerpt": "Short description of the blog",
  "featuredImage": "https://example.com/image.jpg",
  "readTime": 5,
  "publishDate": "2024-01-15T10:00:00Z",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "avatar": "https://example.com/avatar.jpg"
  },
  "tags": ["technology", "programming"],
  "category": "Tech",
  "status": "draft",
  "seoTitle": "SEO Optimized Title",
  "seoDescription": "SEO description for search engines"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Blog created successfully",
  "data": { /* blog object */ }
}
```

### 2. Get All Blogs (Admin)
**GET** `/admin`

Get all blogs with advanced filtering, pagination, and search.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `searchTerm` (string): Search in title, content, excerpt, tags, category, author name
- `category` (string): Filter by category
- `tags` (string): Filter by tags (comma-separated)
- `status` (string): Filter by status (draft, published, archived)
- `author` (string): Filter by author name
- `dateFrom` (string): Filter from date (ISO format)
- `dateTo` (string): Filter to date (ISO format)
- `sortBy` (string): Sort field (title, publishDate, views, likes, createdAt, updatedAt)
- `sortOrder` (string): Sort order (asc, desc)

**Example:**
```
GET /admin?page=1&limit=10&searchTerm=javascript&category=Tech&status=published&sortBy=publishDate&sortOrder=desc
```

### 3. Get Blog Statistics
**GET** `/admin/stats`

Get comprehensive blog statistics.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Blog statistics fetched successfully",
  "data": {
    "overview": {
      "totalBlogs": 150,
      "publishedBlogs": 120,
      "draftBlogs": 25,
      "totalViews": 50000,
      "totalLikes": 2500,
      "avgReadTime": 8.5
    },
    "categoryStats": [
      { "_id": "Tech", "count": 50, "totalViews": 20000 },
      { "_id": "Business", "count": 30, "totalViews": 15000 }
    ],
    "tagStats": [
      { "_id": "javascript", "count": 25 },
      { "_id": "react", "count": 20 }
    ]
  }
}
```

### 4. Get Single Blog (Admin)
**GET** `/admin/:id`

Get a specific blog by ID (includes all statuses).

### 5. Update Blog
**PUT** `/admin/:id`

Update an existing blog.

**Request Body:** (Same as create, all fields optional)

### 6. Delete Blog
**DELETE** `/admin/:id`

Soft delete a blog (sets isDeleted: true, status: archived).

### 7. Publish Blog
**PATCH** `/admin/:id/publish`

Publish a draft blog.

### 8. Unpublish Blog
**PATCH** `/admin/:id/unpublish`

Unpublish a published blog (sets status: draft).

---

## Public Endpoints (No Authentication)

### 1. Get Published Blogs
**GET** `/public`

Get only published blogs with filtering and pagination.

**Query Parameters:** (Same as admin, but only returns published blogs)

**Example:**
```
GET /public?page=1&limit=10&searchTerm=react&category=Tech&sortBy=views&sortOrder=desc
```

### 2. Get Popular Blogs
**GET** `/public/popular`

Get most popular blogs (sorted by views and likes).

**Query Parameters:**
- `limit` (number): Number of blogs to return (default: 10)

### 3. Get Recent Blogs
**GET** `/public/recent`

Get most recently published blogs.

**Query Parameters:**
- `limit` (number): Number of blogs to return (default: 10)

### 4. Get Single Published Blog
**GET** `/public/:id`

Get a specific published blog by ID. Automatically increments view count.

### 5. Get Blog by Slug
**GET** `/public/slug/:slug`

Get a specific published blog by slug. Automatically increments view count.

**Example:**
```
GET /public/slug/my-awesome-blog-post
```

### 6. Get Related Blogs
**GET** `/public/:id/related`

Get blogs related to the specified blog (based on category and tags).

**Query Parameters:**
- `limit` (number): Number of related blogs (default: 5)

### 7. Like Blog
**POST** `/public/:id/like`

Like a blog post.

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Blog liked successfully",
  "data": {
    "likes": 42
  }
}
```

---

## Legacy Endpoints (Backward Compatibility)

### 1. Get Published Blogs
**GET** `/`

Same as `/public` - returns published blogs only.

### 2. Get Single Published Blog
**GET** `/:id`

Same as `/public/:id` - returns published blog by ID.

---

## Response Format

All responses follow this consistent format:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

For paginated responses:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Blogs fetched successfully",
  "data": {
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPage": 15
    },
    "data": [ /* array of blog objects */ ]
  }
}
```

---

## Error Responses

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "errorDetails": [ /* validation errors */ ]
}
```

---

## Features

### Advanced Search
- Full-text search across title, content, excerpt, tags, category, and author name
- Case-insensitive search
- Partial matching

### Filtering
- Filter by category, tags, status, author, date range
- Multiple filter combinations supported
- Tag filtering supports comma-separated values

### Sorting
- Sort by any field (title, publishDate, views, likes, createdAt, updatedAt)
- Ascending or descending order
- Default sorting by publishDate (desc)

### Pagination
- Configurable page size (1-100 items per page)
- Page-based navigation
- Total count and page information included

### SEO Features
- Automatic slug generation from title
- SEO title and description fields
- Meta information for search engines

### Analytics
- View counting (automatic on blog access)
- Like counting
- Reading time calculation
- Comprehensive statistics

### Content Management
- Draft, published, and archived statuses
- Soft delete functionality
- Publish/unpublish controls
- Author information tracking

---

## Usage Examples

### Create a Blog
```bash
curl -X POST /api/v1/blogs/admin/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with React",
    "content": "React is a powerful JavaScript library...",
    "excerpt": "Learn the basics of React development",
    "featuredImage": "https://example.com/react-image.jpg",
    "readTime": 10,
    "author": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tags": ["react", "javascript", "frontend"],
    "category": "Programming"
  }'
```

### Search Published Blogs
```bash
curl "/api/v1/blogs/public?searchTerm=react&category=Programming&sortBy=views&sortOrder=desc&page=1&limit=5"
```

### Get Blog by Slug
```bash
curl "/api/v1/blogs/public/slug/getting-started-with-react"
```

### Like a Blog
```bash
curl -X POST "/api/v1/blogs/public/64a1b2c3d4e5f6789abcdef0/like"
```
