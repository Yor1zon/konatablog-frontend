"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const mockThemes = [
  {
    id: 1,
    name: "Default",
    slug: "default",
    description: "Clean and minimalist default theme",
    active: true,
    previewUrl: "/default-blog-theme.jpg",
  },
  {
    id: 2,
    name: "Modern",
    slug: "modern",
    description: "Contemporary design with bold typography",
    active: false,
    previewUrl: "/modern-blog-theme.jpg",
  },
  {
    id: 3,
    name: "Classic",
    slug: "classic",
    description: "Traditional blog layout with serif fonts",
    active: false,
    previewUrl: "/classic-blog-theme.jpg",
  },
]

export default function AdminThemesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Themes</h2>
          <p className="text-muted-foreground">Customize the look of your blog</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockThemes.map((theme) => (
            <Card key={theme.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                <img
                  src={theme.previewUrl || "/placeholder.svg"}
                  alt={theme.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{theme.name}</CardTitle>
                    <CardDescription>{theme.description}</CardDescription>
                  </div>
                  {theme.active && (
                    <Badge variant="default">
                      <Check className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant={theme.active ? "outline" : "default"}
                  className={`w-full ${!theme.active ? "bg-slate-900 text-white hover:bg-slate-800" : ""}`}
                  disabled={theme.active}
                >
                  {theme.active ? "Currently Active" : "Activate Theme"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
