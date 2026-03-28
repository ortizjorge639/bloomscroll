'use client'

import { TopBar } from '@/components/nav/top-bar'
import { useData } from '@/lib/context/data-context'
import { PostCard } from '@/components/feed/post-card'
import { EmptyState } from '@/components/empty-state'
import { Spinner } from '@/components/ui/spinner'

export default function ListPage() {
  const { filteredBookmarks, isLoading } = useData()

  return (
    <div className="flex h-full flex-col">
      <TopBar title="List" showFilters showCount />
      
      <div className="flex-1 overflow-y-auto">
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
          <div className="flex flex-col divide-y divide-border">
            {filteredBookmarks.map((bookmark) => (
              <PostCard
                key={bookmark.id}
                bookmark={bookmark}
                variant="list"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
