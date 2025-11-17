"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

import { cn } from "@/lib/utils"

export function Breadcrumbs() {
  const pathname = usePathname()

  const segments = React.useMemo(() => {
    const paths = pathname.split("/").filter(Boolean)
    
    return paths.map((segment, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/")
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
      
      return { label, href, isLast: index === paths.length - 1 }
    })
  }, [pathname])

  if (pathname === "/") return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {segments.map((segment, index) => (
        <React.Fragment key={segment.href}>
          <ChevronRight className="h-4 w-4" />
          {segment.isLast ? (
            <span className="font-medium text-foreground">{segment.label}</span>
          ) : (
            <Link
              href={segment.href}
              className="hover:text-foreground transition-colors"
            >
              {segment.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
