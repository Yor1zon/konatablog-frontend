"use client"

import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i)
  const maxVisiblePages = 5

  let visiblePages = pages
  if (totalPages > maxVisiblePages) {
    const start = Math.max(0, Math.min(currentPage - 2, totalPages - maxVisiblePages))
    visiblePages = pages.slice(start, start + maxVisiblePages)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {visiblePages[0] > 0 && (
        <>
          <Button variant="outline" onClick={() => onPageChange(0)}>
            1
          </Button>
          {visiblePages[0] > 1 && <span className="px-2">...</span>}
        </>
      )}

      {visiblePages.map((page) => (
        <Button key={page} variant={page === currentPage ? "default" : "outline"} onClick={() => onPageChange(page)}>
          {page + 1}
        </Button>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 2 && <span className="px-2">...</span>}
          <Button variant="outline" onClick={() => onPageChange(totalPages - 1)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
