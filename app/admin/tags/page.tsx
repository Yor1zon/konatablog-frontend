"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ApiClient, type Tag } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, TagIcon } from "lucide-react"

const defaultColors = [
  "#FF5722",
  "#2196F3",
  "#4CAF50",
  "#FFC107",
  "#9C27B0",
  "#FF9800",
  "#00BCD4",
  "#E91E63",
  "#3F51B5",
  "#8BC34A",
]

export default function AdminTagsPage() {
  const { toast } = useToast()
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    color: defaultColors[0],
  })

  const fetchTags = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await ApiClient.get<Tag[]>("/tags")
      if (response.success && response.data) {
        setTags(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tags")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag)
      setFormData({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || "",
        color: tag.color || defaultColors[0],
      })
    } else {
      setEditingTag(null)
      setFormData({
        name: "",
        slug: "",
        description: "",
        color: defaultColors[0],
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name is required",
      })
      return
    }

    try {
      const response = editingTag
        ? await ApiClient.put<Tag>(`/tags/${editingTag.id}`, formData)
        : await ApiClient.post<Tag>("/tags", formData)

      if (response.success) {
        toast({
          title: "Success",
          description: `Tag ${editingTag ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        fetchTags()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save tag",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this tag?")) return

    try {
      const response = await ApiClient.delete(`/tags/${id}`)
      if (response.success) {
        toast({
          title: "Success",
          description: "Tag deleted successfully",
        })
        fetchTags()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete tag",
      })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">标签</h2>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                New Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="JavaScript"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="javascript"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Articles related to JavaScript..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {defaultColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="h-8 w-8 rounded border-2 transition-all"
                        style={{
                          backgroundColor: color,
                          borderColor: formData.color === color ? "#000" : "transparent",
                        }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSave}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : tags.length === 0 ? (
          <div className="text-center py-20 border rounded-lg">
            <TagIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tags yet. Create your first one!</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>
                      <code className="text-sm">{tag.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: tag.color }}>
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: tag.color }} />
                        {tag.color}
                      </Badge>
                    </TableCell>
                    <TableCell>{tag.postCount || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(tag)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tag.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
