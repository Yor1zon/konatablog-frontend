"use client"

import React, { Children, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"

import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
}

const getTextFromChildren = (children: ReactNode): string =>
  Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child
      if (typeof child === "number") return String(child)
      return ""
    })
    .join("")

const isWrappedInSingleQuotes = (text: string) => {
  const trimmed = text.trim()
  if (trimmed.length < 2) return false

  const quotePairs: Array<[string, string]> = [
    ["‘", "’"],
    ["'", "'"],
    ["‘", "'"],
    ["'", "’"],
  ]

  return quotePairs.some(([start, end]) => trimmed.startsWith(start) && trimmed.endsWith(end))
}

const markdownComponents: Components = {
  h1({ children, ...props }) {
    return <h1 className="text-2xl font-bold mb-4 mt-8" {...props}>{children}</h1>
  },
  h2({ children, ...props }) {
    return <h2 className="text-xl font-bold mb-3 mt-6" {...props}>{children}</h2>
  },
  h3({ children, ...props }) {
    return <h3 className="text-lg font-bold mb-2 mt-4" {...props}>{children}</h3>
  },
  h4({ children, ...props }) {
    return <h4 className="text-base font-bold mb-2 mt-4" {...props}>{children}</h4>
  },
  h5({ children, ...props }) {
    return <h5 className="text-sm font-bold mb-2 mt-4" {...props}>{children}</h5>
  },
  h6({ children, ...props }) {
    return <h6 className="text-sm font-bold mb-2 mt-4 text-muted-foreground" {...props}>{children}</h6>
  },
  blockquote({ children, ...props }) {
    return (
      <blockquote className="border-l-gray-400 border-l-2 pl-4 my-6 text-gray-600 italic max-w-[75%]" {...props}>
        {children}
      </blockquote>
    )
  },
  code(props) {
    const { inline, className, children, ...restProps } = props as any
    const languageClass = className ? className.replace("language-", "") : undefined
    const textContent = getTextFromChildren(children)
    const wrappedWithQuotes = isWrappedInSingleQuotes(textContent)
    const appearsInline = inline || (!textContent.includes("\n") && !className)

    if (appearsInline && wrappedWithQuotes) {
      return <>{children}</>
    }

    if (appearsInline) {
      return (
        <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm font-mono", className)} {...restProps}>
          {children}
        </code>
      )
    }

    return (
      <code className={cn("block text-sm leading-relaxed", className)} data-language={languageClass} {...restProps}>
        {children}
      </code>
    )
  },
  pre({ children, className, ...props }) {
    // Extract language from the first child if it's a code element with className
    const language = className?.includes('language-')
      ? className.replace(/language-/, '')
      : children &&
        React.isValidElement(children) &&
        (children.props as any)?.className?.includes('language-')
        ? (children.props as any).className.replace(/.*language-([a-zA-Z0-9-_]+).*/, '$1')
        : 'code';

    return (
      <div className="relative my-6">
        {language && (
          <span className="absolute top-2 right-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {language}
          </span>
        )}
        <pre className={cn("bg-muted p-4 rounded-lg overflow-x-auto", className)} {...props}>
          {children}
        </pre>
      </div>
    )
  },
  img({ node, ...props }) {
    return <img className="rounded-xl border my-6 w-full" {...props} />
  },
  a({ node, ...props }) {
    return <a className="text-primary underline underline-offset-4" target="_blank" rel="noreferrer" {...props} />
  },
  ul({ children, ...props }) {
    return (
      <ul className="list-disc space-y-2 pl-3" {...props}>
        {children}
      </ul>
    )
  },
  ol({ children, ...props }) {
    return (
      <ol className="list-decimal space-y-2 pl-3" {...props}>
        {children}
      </ol>
    )
  },
  li({ children, ...props }) {
    return (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    )
  },
}

// Simplified components for excerpt rendering (no code blocks)
const excerptComponents: Components = {
  h1({ children, ...props }) {
    return <h1 className="text-lg font-bold mb-2 mt-4" {...props}>{children}</h1>
  },
  h2({ children, ...props }) {
    return <h2 className="text-base font-bold mb-2 mt-3" {...props}>{children}</h2>
  },
  h3({ children, ...props }) {
    return <h3 className="text-sm font-bold mb-1 mt-2" {...props}>{children}</h3>
  },
  blockquote({ children, ...props }) {
    return (
      <blockquote className="border-l-gray-400 border-l-2 pl-3 my-3 text-gray-600 italic text-sm" {...props}>
        {children}
      </blockquote>
    )
  },
  code(props) {
    const { inline, className, children, ...restProps } = props as any
    const textContent = getTextFromChildren(children)
    const appearsInline = inline || (!textContent.includes("\n") && !className)

    if (!appearsInline) {
      // Don't render code blocks in excerpts, just show inline code
      return <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{textContent}</code>
    }

    return (
      <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm font-mono", className)} {...restProps}>
        {children}
      </code>
    )
  },
  img({ ...props }) {
    // Don't render images in excerpts
    return null
  },
  a({ node, children, ...props }) {
    return <a className="text-primary underline underline-offset-2" target="_blank" rel="noreferrer" {...props}>{children}</a>
  },
  ul({ children, ...props }) {
    return (
      <ul className="list-disc space-y-1 text-sm ml-3" {...props}>
        {children}
      </ul>
    )
  },
  ol({ children, ...props }) {
    return (
      <ol className="list-decimal space-y-1 text-sm ml-3" {...props}>
        {children}
      </ol>
    )
  },
  li({ children, ...props }) {
    return (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    )
  },
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        className="prose prose-lg dark:prose-invert max-w-none"
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={markdownComponents}
      >
        {content.replace(/\r\n/g, "\n")}
      </ReactMarkdown>
    </div>
  )
}

export function ExcerptMarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className="text-muted-foreground leading-relaxed"
      remarkPlugins={[remarkGfm]}
      components={excerptComponents}
    >
      {content.replace(/\r\n/g, "\n")}
    </ReactMarkdown>
  )
}
