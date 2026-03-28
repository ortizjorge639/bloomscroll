'use client'

import { TopBar } from '@/components/nav/top-bar'
import { useData } from '@/lib/context/data-context'
import { PostCard } from '@/components/feed/post-card'
import { EmptyState } from '@/components/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { Archive } from 'lucide-react'

export default function ArchivedPage() {
  const { archivedBookmarks, isLoading } = useData()

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Archived" showFilters={false} showCount={false} />
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : archivedBookmarks.length === 0 ? (
          <EmptyState
            icon={Archive}
            title="No archived bookmarks"
            description="Bookmarks you archive will appear here. You can restore them anytime."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archivedBookmarks.map((bookmark) => (
              <PostCard
                key={bookmark.id}
                bookmark={bookmark}
                variant="compact"
                showUnarchive
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
