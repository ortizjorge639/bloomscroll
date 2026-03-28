import { BloomScrollFeed } from '@/components/feed/bloom-scroll-feed'
import { TopBar } from '@/components/nav/top-bar'

export default function FeedPage() {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Feed" showFilters showCount />
      <BloomScrollFeed />
    </div>
  )
}
