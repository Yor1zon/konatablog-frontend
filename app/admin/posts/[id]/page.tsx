"use client"

import { useParams } from "next/navigation"
import { PostEditor } from "@/components/admin/post-editor"

export default function EditPostPage() {
  const params = useParams()
  const postId = Number.parseInt(params.id as string)

  return <PostEditor postId={postId} />
}
