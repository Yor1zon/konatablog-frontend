"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApiClient, type Post, type PageResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { useToast } from "@/hooks/use-toast"

export default function AdminPostsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const endpoint = searchQuery
        ? `/posts/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}&size=10`
        : `/posts?page=${currentPage}&size=10&sort=createdAt,desc`

      const response = await ApiClient.get<PageResponse<Post>>(endpoint)
      if (response.success && response.data) {
        setPosts(response.data.content)
        setTotalPages(response.data.totalPages)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(0)
    fetchPosts()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      const response = await ApiClient.delete(`/posts/${id}`)
      if (response.success) {
        toast({
          title: "Success",
          description: "Post deleted successfully",
        })
        fetchPosts()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete post",
      })
    }
  }

  const handlePublish = async (id: number, currentStatus: string) => {
    try {
      const endpoint = currentStatus === "PUBLISHED" ? `/posts/${id}/unpublish` : `/posts/${id}/publish`

      const response = await ApiClient.post(endpoint)
      if (response.success) {
        toast({
          title: "Success",
          description: `Post ${currentStatus === "PUBLISHED" ? "unpublished" : "published"} successfully`,
        })
        fetchPosts()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update post status",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Posts</h2>
            <p className="text-muted-foreground">Manage your blog posts</p>
          </div>
          <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => router.push("/admin/posts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSearch}>Search</Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border rounded-lg">
            <p className="text-muted-foreground">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-md">
                        <div className="line-clamp-1">{post.title}</div>
                      </TableCell>
                      <TableCell>
                        {post.category ? (
                          <Badge variant="secondary">{post.category.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">No category</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.status === "PUBLISHED" ? "default" : "outline"}>{post.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          {post.viewCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/posts/${post.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePublish(post.id, post.status)}>
                              {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/posts/${post.slug}`, "_blank")}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
