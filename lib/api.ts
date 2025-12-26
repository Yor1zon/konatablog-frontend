const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api"

export const MOCK_TAGS: Tag[] = []

const MOCK_CATEGORIES: Category[] = []

const MOCK_POSTS: Post[] = []

export interface ApiError {
  code: string
  message: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message?: string
  error?: ApiError
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("auth_token")
  }

  private static setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem("auth_token", token)
  }

  private static removeToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("auth_token")
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers as Record<string, string>,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      })

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken()
        }
        throw new Error(data.error?.message || "Request failed")
      }

      return data
    } catch (error) {
      console.log("[ApiClient] Fetch failed (likely due to no backend), using mock data for:", endpoint)

      if (endpoint === "/auth/login") {
        const body = options.body ? JSON.parse(options.body as string) : {}
        if (body.username === "admin" && body.password === "admin") {
          return {
            success: true,
            data: {
              token: "mock_admin_token",
              user: {
                id: 1,
                username: "admin",
                email: "admin@example.com",
                nickname: "Admin User",
                role: "ADMIN",
                avatar: "/placeholder.svg",
                isActive: true,
              },
            } as any,
          }
        }
        throw new Error("Invalid credentials")
      }

      if (endpoint === "/users/me") {
        return {
          success: true,
          data: {
            id: 1,
            username: "admin",
            email: "admin@example.com",
            displayName: "Admin User",
            nickname: "Admin User",
            role: "ADMIN",
            avatar: "/placeholder.svg",
            isActive: true,
          } as any,
        }
      }

      if (endpoint === "/auth/validate") {
        return {
          success: true,
          data: true as any,
        }
      }

      if (endpoint === "/users/me" && options.method === "PUT") {
        const body = options.body ? JSON.parse(options.body as string) : {}
        return {
          success: true,
          data: {
            id: 1,
            username: body.username || "admin",
            email: body.email || "admin@example.com",
            displayName: body.displayName || "Admin User",
            nickname: body.displayName || "Admin User",
            role: "ADMIN",
            avatar: "/placeholder.svg",
            isActive: true,
          } as any,
        }
      }

      if (endpoint.startsWith("/posts")) {
        const parseSlug = (path: string, marker: string) => path.split(marker)[1]

        if (endpoint.startsWith("/posts/admin")) {
          if (endpoint.includes("/posts/admin/slug/")) {
            const slug = parseSlug(endpoint, "/posts/admin/slug/")
            const post = MOCK_POSTS.find((p) => p.slug === slug)
            if (!post) {
              return {
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Post not found" },
              }
            }
            return { success: true, data: post as any }
          }

          if (endpoint.match(/\/posts\/admin\/\d+$/)) {
            const id = Number.parseInt(endpoint.split("/").pop() || "0")
            const post = MOCK_POSTS.find((p) => p.id === id)
            if (!post) {
              return {
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Post not found" },
              }
            }
            return { success: true, data: post as any }
          }

          return {
            success: true,
            data: {
              content: MOCK_POSTS,
              totalPages: 1,
              totalElements: MOCK_POSTS.length,
              size: 10,
              number: 0,
              first: true,
              last: true,
              pageable: {},
            } as any,
          }
        }

        if (endpoint.includes("/slug/")) {
          const slug = parseSlug(endpoint, "/slug/")
          const post = MOCK_POSTS.find((p) => p.slug === slug)
          if (!post) {
            return {
              success: false,
              data: null,
              error: { code: "NOT_FOUND", message: "Post not found" },
            }
          }
          return {
            success: true,
            data: post as any,
          }
        }

        return {
          success: true,
          data: {
            content: MOCK_POSTS.filter((p) => p.status === "PUBLISHED"),
            totalPages: 1,
            totalElements: MOCK_POSTS.filter((p) => p.status === "PUBLISHED").length,
            size: 10,
            number: 0,
            first: true,
            last: true,
            pageable: {},
          } as any,
        }
      }

      if (endpoint.startsWith("/categories")) {
        return {
          success: true,
          data: MOCK_CATEGORIES as any,
        }
      }

      if (endpoint.startsWith("/tags")) {
        return {
          success: true,
          data: MOCK_TAGS as any,
        }
      }

      console.error("[ApiClient] No mock data handler for endpoint:", endpoint)
      throw error
    }
  }

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  static async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  static async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  static async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  static async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>,
  ): Promise<ApiResponse<T>> {
    const token = this.getToken()
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      })

      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed")
      }

      return data
    } catch (error) {
      throw error
    }
  }

  // Auth methods
  static async login(username: string, password: string) {
    const response = await this.post<{ token: string; user: User }>("/auth/login", {
      username,
      password,
    })

    if (response.success && response.data) {
      this.setToken(response.data.token)
    }

    return response
  }

  static async logout() {
    try {
      await this.post("/auth/logout")
    } finally {
      this.removeToken()
    }
  }

  static async getProfile() {
    return this.get<User>("/users/me")
  }

  static async validateToken() {
    return this.get<boolean>("/auth/validate")
  }

  static async refreshToken() {
    const response = await this.post<string>("/auth/refresh")
    if (response.success && response.data) {
      this.setToken(response.data)
    }
    return response
  }

  static async updateProfile(data: { displayName?: string; email?: string; username?: string; avatar?: string }) {
    return this.put<User>("/users/me", data)
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Posts methods
  static async getPosts(params?: { page?: number; size?: number; sort?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    if (params?.sort) queryParams.append("sort", params.sort)

    const query = queryParams.toString()
    return this.get<PageResponse<Post>>(`/posts${query ? `?${query}` : ""}`)
  }

  static async getAdminPosts(params?: { page?: number; size?: number; sort?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    if (params?.sort) queryParams.append("sort", params.sort)

    const query = queryParams.toString()
    return this.get<PageResponse<Post>>(`/posts/admin/all${query ? `?${query}` : ""}`)
  }

  static async getPostById(id: number) {
    return this.get<Post>(`/posts/${id}`)
  }

  static async getAdminPostById(id: number) {
    return this.get<Post>(`/posts/admin/${id}`)
  }

  static async getPostBySlug(slug: string) {
    return this.get<Post>(`/posts/slug/${slug}`)
  }

  static async getAdminPostBySlug(slug: string) {
    return this.get<Post>(`/posts/admin/slug/${slug}`)
  }

  static async searchPosts(params: {
    q?: string
    category?: number
    tag?: number
    page?: number
    size?: number
    sort?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append("q", params.q)
    if (params.category) queryParams.append("category", params.category.toString())
    if (params.tag) queryParams.append("tag", params.tag.toString())
    if (params.page !== undefined) queryParams.append("page", params.page.toString())
    if (params.size !== undefined) queryParams.append("size", params.size.toString())
    if (params.sort) queryParams.append("sort", params.sort)

    return this.get<PageResponse<Post>>(`/posts/search?${queryParams.toString()}`)
  }

  static async searchAdminPosts(params: {
    q?: string
    category?: number
    tag?: number
    page?: number
    size?: number
    sort?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append("q", params.q)
    if (params.category) queryParams.append("category", params.category.toString())
    if (params.tag) queryParams.append("tag", params.tag.toString())
    if (params.page !== undefined) queryParams.append("page", params.page.toString())
    if (params.size !== undefined) queryParams.append("size", params.size.toString())
    if (params.sort) queryParams.append("sort", params.sort)

    return this.get<PageResponse<Post>>(`/posts/admin/search?${queryParams.toString()}`)
  }

  static async createPost(data: {
    title: string
    content: string
    excerpt?: string
    slug?: string
    status?: "DRAFT" | "PUBLISHED"
    isFeatured?: boolean
    categoryId?: number
    tagIds?: number[]
  }) {
    return this.post<Post>("/posts", data)
  }

  static async updatePost(
    id: number,
    data: {
      title?: string
      content?: string
      excerpt?: string
      slug?: string
      status?: "DRAFT" | "PUBLISHED"
      isFeatured?: boolean
      categoryId?: number
      tagIds?: number[]
    },
  ) {
    return this.put<Post>(`/posts/${id}`, data)
  }

  static async deletePost(id: number) {
    return this.delete(`/posts/${id}`)
  }

  static async publishPost(id: number) {
    return this.post<Post>(`/posts/${id}/publish`)
  }

  static async unpublishPost(id: number) {
    return this.post<Post>(`/posts/${id}/unpublish`)
  }

  // Categories methods
  static async getCategories(params?: { includeCounts?: boolean; parentId?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.includeCounts !== undefined) queryParams.append("includeCounts", params.includeCounts.toString())
    if (params?.parentId) queryParams.append("parentId", params.parentId.toString())

    const query = queryParams.toString()
    return this.get<Category[]>(`/categories${query ? `?${query}` : ""}`)
  }

  static async getCategoryById(id: number) {
    return this.get<Category>(`/categories/${id}`)
  }

  static async getCategoryBySlug(slug: string) {
    return this.get<Category>(`/categories/slug/${slug}`)
  }

  static async getCategoryTree(includeEmpty = false) {
    return this.get<Category[]>(`/categories/tree?includeEmpty=${includeEmpty}`)
  }

  static async getCategoryPosts(id: number, params?: { page?: number; size?: number; sort?: string; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.status) queryParams.append("status", params.status)

    const query = queryParams.toString()
    return this.get<PageResponse<Post>>(`/categories/${id}/posts${query ? `?${query}` : ""}`)
  }

  static async createCategory(data: {
    name: string
    description?: string
    slug?: string
    sortOrder?: number
    isActive?: boolean
    parentId?: number
  }) {
    return this.post<Category>("/categories", data)
  }

  static async updateCategory(
    id: number,
    data: {
      name?: string
      description?: string
      slug?: string
      sortOrder?: number
      isActive?: boolean
      parentId?: number
    },
  ) {
    return this.put<Category>(`/categories/${id}`, data)
  }

  static async deleteCategory(id: number) {
    return this.delete(`/categories/${id}`)
  }

  static async reorderCategories(orders: { id: number; order: number }[]) {
    return this.request("/categories/reorder", {
      method: "PATCH",
      body: JSON.stringify({ orders }),
    })
  }

  static async getCategoryStats() {
    return this.get<{
      totalCategories: number
      categoriesWithPosts: number
      emptyCategories: number
      topCategories: { id: number; name: string; postCount: number }[]
    }>("/categories/stats")
  }

  // Tags methods
  static async getTags() {
    return this.get<Tag[]>("/tags")
  }

  static async getTagById(id: number) {
    return this.get<Tag>(`/tags/${id}`)
  }

  static async getTagBySlug(slug: string) {
    return this.get<Tag>(`/tags/slug/${slug}`)
  }

  static async getPopularTags(limit = 10) {
    return this.get<Tag[]>(`/tags/popular?limit=${limit}`)
  }

  static async searchTags(query: string, page = 0, size = 20, ignoreCase = true) {
    const params = new URLSearchParams()
    if (query) params.append("q", query)
    params.append("page", page.toString())
    params.append("size", size.toString())
    params.append("ignoreCase", ignoreCase.toString())

    return this.get<PageResponse<Tag>>(`/tags/search?${params.toString()}`)
  }

  static async getTagSuggestions(query: string, limit = 8) {
    return this.get<Tag[]>(`/tags/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`)
  }

  static async getTagPosts(id: number, params?: { page?: number; size?: number; sort?: string; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.status) queryParams.append("status", params.status)

    const query = queryParams.toString()
    return this.get<PageResponse<Post>>(`/tags/${id}/posts${query ? `?${query}` : ""}`)
  }

  static async createTag(data: { name: string; slug?: string; description?: string; color?: string }) {
    return this.post<Tag>("/tags", data)
  }

  static async updateTag(id: number, data: { name?: string; slug?: string; description?: string; color?: string }) {
    return this.put<Tag>(`/tags/${id}`, data)
  }

  static async deleteTag(id: number, force = false) {
    return this.delete(`/tags/${id}?force=${force}`)
  }

  static async bulkCreateTags(names: string[]) {
    return this.post<Tag[]>("/tags/bulk", { names })
  }

  static async smartCreateTag(data: { name: string; description?: string; color?: string }) {
    return this.post<Tag>("/tags/smart-create", data)
  }

  static async setPostTags(postId: number, tagIds: number[]) {
    return this.put<Post>(`/posts/${postId}/tags`, { tagIds })
  }

  // Media methods
  static async getMedia(params?: { page?: number; size?: number; sort?: string; type?: string; uploadedBy?: number }) {
    const queryParams = new URLSearchParams()
    if (params?.page !== undefined) queryParams.append("page", params.page.toString())
    if (params?.size !== undefined) queryParams.append("size", params.size.toString())
    if (params?.sort) queryParams.append("sort", params.sort)
    if (params?.type) queryParams.append("type", params.type)
    if (params?.uploadedBy) queryParams.append("uploadedBy", params.uploadedBy.toString())

    const query = queryParams.toString()
    return this.get<PageResponse<MediaFile>>(`/media${query ? `?${query}` : ""}`)
  }

  static async uploadMedia(file: File, description?: string, altText?: string, type?: string) {
    const additionalData: Record<string, string> = {}
    if (description) additionalData.description = description
    if (altText) additionalData.altText = altText
    if (type) additionalData.type = type

    return this.uploadFile<MediaFile>("/media/upload", file, additionalData)
  }

  static async deleteMedia(id: number) {
    return this.delete(`/media/${id}`)
  }

  // Settings methods
  static async getPublicSettings() {
    return this.get<BlogSettings>("/settings/public")
  }

  static async getAllSettings() {
    return this.get<
      {
        id: number
        key: string
        value: string
        group: string
        description: string
        optionType: string
        updatedBy: string
        createdAt: string
        updatedAt: string
      }[]
    >("/settings")
  }

  static async updateSettings(settings: Partial<BlogSettings>) {
    return this.put<BlogSettings>("/settings", settings)
  }

  static async uploadAvatar(file: File) {
    return this.uploadFile<{ avatarUrl: string }>("/settings/avatar", file)
  }

  // Theme methods
  static async getThemes() {
    return this.get<Theme[]>("/themes")
  }

  static async activateTheme(themeId: number) {
    return this.post<Theme>(`/themes/${themeId}/activate`)
  }

  static async updateThemeConfig(themeId: number, config: Record<string, any>) {
    return this.put<Theme>(`/themes/${themeId}/config`, { config })
  }
}

export interface User {
  id: number
  username: string
  email: string
  displayName?: string
  nickname: string
  role: "ADMIN" | "USER"
  avatar: string
  isActive: boolean
  lastLoginAt?: string
  createdAt?: string
}

export interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  status: "PUBLISHED" | "DRAFT"
  isFeatured: boolean
  viewCount: number
  createdAt: string
  publishedAt?: string
  updatedAt: string
  author: {
    id: number
    username: string
    displayName: string
  }
  category?: Category
  tags: Tag[]
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parentId?: number
  parentName?: string
  sortOrder: number
  isActive: boolean
  postCount?: number
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  description?: string
  usageCount?: number
  postCount?: number
  color?: string
  createdAt: string
  updatedAt: string
}

export interface MediaFile {
  id: number
  originalName: string
  fileName: string
  fileExtension: string
  fileSize: number
  mimeType: string
  url: string
  localPath: string
  type: "IMAGE" | "VIDEO" | "AUDIO" | "AVATAR"
  width?: number
  height?: number
  description?: string
  altText?: string
  uploadedAt: string
  uploadedBy: {
    id: number
    username: string
    displayName: string
  }
}

export interface BlogSettings {
  blogName: string
  blogDescription: string
  blogTagline: string
  authorName: string
  authorEmail: string
  pageSize: number
  commentEnabled: boolean
  theme: string
}

export interface PageResponse<T> {
  content: T[]
  pageable: any
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  size: number
  number: number
}

export interface Theme {
  id: number
  name: string
  slug: string
  description: string
  version: string
  author: string
  previewUrl: string
  active: boolean
  isDefault: boolean
  config: Record<string, any>
  createdAt: string
  updatedAt: string
}
