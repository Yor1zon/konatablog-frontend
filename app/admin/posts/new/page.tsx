"use client"

import { PostEditor } from "@/components/admin/post-editor"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function NewPostPage() {
  return (
    <AdminLayout>
      <PostEditor />
    </AdminLayout>
  )
}
