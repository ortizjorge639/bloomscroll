'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { useData } from '@/lib/context/data-context'
import * as bookmarkStorage from '@/lib/storage/bookmarks'
import { cn } from '@/lib/utils'
import {
  Twitter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Download,
  ExternalLink,
} from 'lucide-react'

interface XStatus {
  configured: boolean
  connected: boolean
  user: { id: string; name: string; username: string; avatar?: string } | null
}

export function XConnect() {
  const { refreshData } = useData()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<XStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [syncProgress, setSyncProgress] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/x/status')
      const data = await res.json() as XStatus
      setStatus(data)
    } catch {
      setStatus({ configured: false, connected: false, user: null })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check status on mount
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Handle OAuth redirect result
  useEffect(() => {
    const connected = searchParams.get('x_connected')
    const error = searchParams.get('x_error')

    if (connected === 'true') {
      toast.success('X account connected! Syncing bookmarks…')
      fetchStatus().then(() => {
        // Auto-sync after successful connection
        handleSync()
      })
      // Clean URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete('x_connected')
      router.replace('/settings?' + params.toString())
    } else if (error) {
      const messages: Record<string, string> = {
        invalid_state: 'Authorization failed (invalid state). Please try again.',
        missing_params: 'Authorization failed (missing parameters). Please try again.',
        not_configured: 'X OAuth is not configured on this server.',
        access_denied: 'Access was denied. Please authorize BloomScroll to read your bookmarks.',
        token_expired: 'Your X session expired. Please reconnect.',
      }
      toast.error(messages[error] ?? `X OAuth error: ${error}`)
      const params = new URLSearchParams(searchParams.toString())
      params.delete('x_error')
      router.replace('/settings?' + params.toString())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConnect = () => {
    window.location.href = '/api/auth/x'
  }

  const handleSync = useCallback(async () => {
    setIsSyncing(true)
    setSyncProgress('Fetching your X bookmarks…')

    try {
      const res = await fetch('/api/x/bookmarks?max=500')

      if (res.status === 401) {
        const data = await res.json() as { error: string }
        if (data.error === 'not_connected') {
          toast.error('Please connect your X account first')
          await fetchStatus()
          return
        }
        if (data.error === 'token_expired') {
          toast.error('Your X session expired. Please reconnect.')
          await fetchStatus()
          return
        }
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const { bookmarks, count } = await res.json() as {
        bookmarks: Array<{
          url: string
          text: string
          author: { name: string; handle: string; avatar?: string }
          timestamp: number
          media?: Array<{ type: 'image' | 'video' | 'gif'; url: string }>
        }>
        count: number
      }

      setSyncProgress(`Importing ${count} bookmarks…`)

      const result = await bookmarkStorage.importBookmarks(bookmarks)
      await refreshData()

      const msg = [
        `Imported ${result.imported} bookmark${result.imported !== 1 ? 's' : ''}`,
        result.duplicates > 0 ? `${result.duplicates} already existed` : null,
      ]
        .filter(Boolean)
        .join(' · ')

      toast.success(msg)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync bookmarks'
      toast.error(message)
    } finally {
      setIsSyncing(false)
      setSyncProgress(null)
    }
  }, [fetchStatus, refreshData])

  const handleDisconnect = async () => {
    if (!confirm('Disconnect your X account? Your existing bookmarks will not be deleted.')) return

    setIsDisconnecting(true)
    try {
      await fetch('/api/x/disconnect', { method: 'POST' })
      await fetchStatus()
      toast.success('X account disconnected')
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
        <Spinner className="h-4 w-4" />
        Checking connection…
      </div>
    )
  }

  if (!status?.configured) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">X OAuth not configured</p>
            <p className="text-xs text-muted-foreground">
              Add{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">X_CLIENT_ID</code>{' '}
              and{' '}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                X_CLIENT_SECRET
              </code>{' '}
              to your environment variables to enable direct X bookmark sync.
            </p>
            <a
              href="https://developer.x.com/en/portal/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open X Developer Portal
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (status.connected && status.user) {
    return (
      <div className="flex flex-col gap-4">
        {/* Connected state */}
        <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {status.user.avatar ? (
              <img
                src={status.user.avatar}
                alt={status.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Twitter className="h-4 w-4 text-[#1DA1F2]" />
            )}
          </div>
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium">{status.user.name}</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span className="text-xs text-muted-foreground">@{status.user.username}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="default"
            className="flex-1 gap-2"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <>
                <Spinner className="h-4 w-4" />
                {syncProgress ?? 'Syncing…'}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Sync Bookmarks
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            disabled={isSyncing}
            className="shrink-0"
            title="Refresh bookmarks"
          >
            <RefreshCw className={cn('h-4 w-4', isSyncing && 'animate-spin')} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Disconnect X account"
          >
            {isDisconnecting ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </Button>
        </div>

        {syncProgress && (
          <p className="text-center text-xs text-muted-foreground">{syncProgress}</p>
        )}
      </div>
    )
  }

  // Not connected
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Connect your X account to automatically import and sync your bookmarks — no file export
        needed.
      </p>
      <Button variant="default" className="gap-2 self-start" onClick={handleConnect}>
        <Twitter className="h-4 w-4" />
        Connect X Account
      </Button>
    </div>
  )
}
