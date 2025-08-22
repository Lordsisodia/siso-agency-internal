import * as React from "react"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  separator?: React.ReactNode
  children: React.ReactNode
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean
  children: React.ReactNode
}

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean
  children: React.ReactNode
  href?: string;
}

export interface BreadcrumbListProps extends React.HTMLAttributes<HTMLOListElement> {
  children: React.ReactNode
}

export interface BreadcrumbPageProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
}

export interface BreadcrumbSeparatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode
}

export function Breadcrumb({
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn("flex items-center text-sm text-muted-foreground", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5">
        {props.children}
      </ol>
    </nav>
  )
}

export function BreadcrumbList({
  className,
  children,
  ...props
}: BreadcrumbListProps) {
  return (
    <ol
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </ol>
  )
}

export function BreadcrumbItem({ 
  className, 
  isCurrentPage, 
  children, 
  ...props 
}: BreadcrumbItemProps) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      aria-current={isCurrentPage ? "page" : undefined}
      {...props}
    >
      {children}
      {!isCurrentPage && <span className="mx-1 text-muted-foreground"><ChevronRight className="h-4 w-4 text-neutral-500" /></span>}
    </li>
  )
}

export function BreadcrumbLink({ 
  asChild, 
  className, 
  children, 
  href,
  ...props 
}: BreadcrumbLinkProps) {
  if (asChild) {
    return (
      <span className={cn("text-neutral-400 hover:text-neutral-200 transition-colors", className)}>
        {children}
      </span>
    )
  }
  
  return (
    <Link
      to={href || "#"}
      className={cn("text-neutral-400 hover:text-neutral-200 transition-colors", className)}
      {...props}
    >
      {children}
    </Link>
  )
}

export function BreadcrumbPage({
  className,
  children,
  ...props
}: BreadcrumbPageProps) {
  return (
    <span
      className={cn("text-neutral-300 font-medium", className)}
      aria-current="page"
      {...props}
    >
      {children}
    </span>
  )
}

export function BreadcrumbSeparator({
  className,
  children,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <span
      className={cn("text-neutral-500 mx-1", className)}
      {...props}
    >
      {children || <ChevronRight className="h-4 w-4" />}
    </span>
  )
}

