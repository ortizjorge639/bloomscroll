import { LucideIcon, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  showImportGuide?: boolean
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  showImportGuide = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-4 p-8 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {showImportGuide && (
        <div className="mt-2 w-full max-w-sm rounded-xl border border-border bg-muted/40 p-4 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            How to import your X bookmarks
          </p>
          <ol className="flex flex-col gap-2.5">
            {[
              <>On X, go to <strong>Settings → Your Account</strong></>,
              <>Tap <strong>Download an archive of your data</strong></>,
              <>Request the archive — X emails it within 24 hrs</>,
              <>Open the zip, find <code className="rounded bg-muted px-1 font-mono text-xs">data/bookmarks.js</code></>,
              <><Link href="/settings" className="font-medium text-primary underline underline-offset-2">Go to Settings</Link> and tap <strong>Import JSON</strong></>,
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="leading-5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
