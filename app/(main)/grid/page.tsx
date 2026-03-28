'use client'

import { TopBar } from '@/components/nav/top-bar'
import { useData } from '@/lib/context/data-context'
import { PostCard } from '@/components/feed/post-card'
import { EmptyState } from '@/components/empty-state'
import { Spinner } from '@/components/ui/spinner'

export default function GridPage() {
  const { filteredBookmarks, isLoading } = useData()

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Grid" showFilters showCount />
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <EmptyState
            title="No bookmarks yet"
            description="Import your X bookmarks or add them manually to get started."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBookmarks.map((bookmark) => (
              <PostCard
                key={bookmark.id}
                bookmark={bookmark}
                variant="compact"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
