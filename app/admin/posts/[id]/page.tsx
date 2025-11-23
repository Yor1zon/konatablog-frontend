"use client"

import { useParams } from "next/navigation"
import { PostEditor } from "@/components/admin/post-editor"
import { AdminLayout } from "@/components/admin/admin-layout"

export default function EditPostPage() {
  const params = useParams()
  const postId = Number.parseInt(params.id as string)

  return (
    <AdminLayout>
      <PostEditor postId={postId} />
    </AdminLayout>
  )
}
