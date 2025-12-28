"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ApiClient, type MediaFile, type PageResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash2, Copy, Search, X } from "lucide-react"
import { Pagination } from "@/components/pagination"

export default function AdminMediaPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<MediaFile[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchMedia = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await ApiClient.get<PageResponse<MediaFile>>(
        `/media?page=${currentPage}&size=12&sort=uploadedAt,desc`,
      )
      if (response.success && response.data) {
        setMedia(response.data.content)
        setTotalPages(response.data.totalPages)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch media")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [currentPage])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Only image files (jpg, png, gif, webp) are allowed",
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size must be less than 5MB",
      })
      return
    }

    setIsUploading(true)
    try {
      const response = await ApiClient.uploadFile<MediaFile>("/media/upload", file)
      if (response.success) {
        toast({
          title: "Success",
          description: "File uploaded successfully",
        })
        fetchMedia()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload file",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const response = await ApiClient.delete(`/media/${id}`)
      if (response.success) {
        toast({
          title: "Success",
          description: "File deleted successfully",
        })
        fetchMedia()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete file",
      })
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied",
      description: "URL copied to clipboard",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const filteredMedia = media.filter((file) => file.originalName.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Media Library</h2>
            <p className="text-muted-foreground">Manage your images and files</p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-20 border rounded-lg">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No files found matching your search." : "No files yet. Upload your first file!"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedia.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.altText || file.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <p className="font-medium text-sm line-clamp-1" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                        {file.width && file.height && (
                          <>
                            {" "}
                            • {file.width} × {file.height}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleCopyUrl(file.url)}
                      >
                        <Copy className="mr-2 h-3 w-3" />
                        Copy URL
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!searchQuery && totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </>
        )}
      </div>
  )
}
