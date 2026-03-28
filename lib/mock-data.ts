// Mock data for development and demo purposes

import { Bookmark, Tag } from '@/types'

export const MOCK_TAGS: Tag[] = [
  { id: 'tag-1', name: 'AI', color: 'blue', createdAt: Date.now() - 86400000 * 7 },
  { id: 'tag-2', name: 'Design', color: 'purple', createdAt: Date.now() - 86400000 * 6 },
  { id: 'tag-3', name: 'Tech', color: 'cyan', createdAt: Date.now() - 86400000 * 5 },
  { id: 'tag-4', name: 'Startup', color: 'green', createdAt: Date.now() - 86400000 * 4 },
  { id: 'tag-5', name: 'Product', color: 'orange', createdAt: Date.now() - 86400000 * 3 },
]

export const MOCK_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-1',
    url: 'https://x.com/karpathy/status/1234567890',
    text: 'The most important thing I learned building AI systems: start simple, measure everything, iterate fast. The best models are built through thousands of small experiments, not grand architectural decisions. Ship something today.',
    author: {
      name: 'Andrej Karpathy',
      handle: 'karpathy',
      avatar: 'https://pbs.twimg.com/profile_images/1234567890/avatar.jpg',
    },
    timestamp: Date.now() - 3600000 * 2,
    savedAt: Date.now() - 3600000,
    archived: false,
    tags: ['tag-1', 'tag-3'],
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        alt: 'AI visualization',
      },
    ],
  },
  {
    id: 'bm-2',
    url: 'https://x.com/naval/status/1234567891',
    text: 'Specific knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now. Building specific knowledge will feel like play to you but will look like work to others.',
    author: {
      name: 'Naval',
      handle: 'naval',
    },
    timestamp: Date.now() - 3600000 * 5,
    savedAt: Date.now() - 3600000 * 2,
    archived: false,
    tags: ['tag-4'],
  },
  {
    id: 'bm-3',
    url: 'https://x.com/paborenstein/status/1234567892',
    text: 'Design tip: The best interfaces disappear. If users are thinking about your UI, you have failed. They should be thinking about their goals, their content, their next action. Your job is to be invisible.',
    author: {
      name: 'Pablo Borenstein',
      handle: 'paborenstein',
    },
    timestamp: Date.now() - 3600000 * 8,
    savedAt: Date.now() - 3600000 * 4,
    archived: false,
    tags: ['tag-2', 'tag-5'],
  },
  {
    id: 'bm-4',
    url: 'https://x.com/sama/status/1234567893',
    text: 'Most people overestimate what they can do in a year and underestimate what they can do in a decade. The trick is to pick something you can compound at. Skills compound. Relationships compound. Knowledge compounds.',
    author: {
      name: 'Sam Altman',
      handle: 'sama',
    },
    timestamp: Date.now() - 86400000,
    savedAt: Date.now() - 3600000 * 12,
    archived: false,
    tags: ['tag-1', 'tag-4'],
  },
  {
    id: 'bm-5',
    url: 'https://x.com/rauchg/status/1234567894',
    text: 'The future of web development:\n\n1. AI-assisted coding\n2. Edge-first deployment\n3. Real-time collaboration\n4. Zero-config tools\n\nWe are building the platform for all of this at Vercel.',
    author: {
      name: 'Guillermo Rauch',
      handle: 'rauchg',
    },
    timestamp: Date.now() - 86400000 * 2,
    savedAt: Date.now() - 86400000,
    archived: false,
    tags: ['tag-3', 'tag-5'],
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800',
        alt: 'Code on screen',
      },
    ],
  },
  {
    id: 'bm-6',
    url: 'https://x.com/paulg/status/1234567895',
    text: 'The way to get startup ideas is not to try to think of startup ideas. It is to look for problems, preferably problems you have yourself. The very best startup ideas tend to have three things in common: they are something the founders themselves want, that they themselves can build, and that few others realize are worth doing.',
    author: {
      name: 'Paul Graham',
      handle: 'paulg',
    },
    timestamp: Date.now() - 86400000 * 3,
    savedAt: Date.now() - 86400000 * 1.5,
    archived: false,
    tags: ['tag-4'],
  },
  {
    id: 'bm-7',
    url: 'https://x.com/jmwind/status/1234567896',
    text: 'After 10 years of building products:\n\nSimple > Complex\nFast > Perfect\nShipped > Planned\nUser feedback > Your opinion\nSmall iterations > Big launches\n\nThe best products are obvious in hindsight.',
    author: {
      name: 'JM Wind',
      handle: 'jmwind',
    },
    timestamp: Date.now() - 86400000 * 4,
    savedAt: Date.now() - 86400000 * 2,
    archived: false,
    tags: ['tag-5', 'tag-2'],
  },
  {
    id: 'bm-8',
    url: 'https://x.com/elonmusk/status/1234567897',
    text: 'Physics is the law, everything else is a recommendation. Start from first principles. Question every assumption. If you cannot explain something simply, you do not understand it well enough.',
    author: {
      name: 'Elon Musk',
      handle: 'elonmusk',
    },
    timestamp: Date.now() - 86400000 * 5,
    savedAt: Date.now() - 86400000 * 3,
    archived: false,
    tags: ['tag-3', 'tag-1'],
  },
]

export const MOCK_ARCHIVED_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-archived-1',
    url: 'https://x.com/old/status/111111',
    text: 'This is an archived bookmark that the user has already processed and saved for later reference.',
    author: {
      name: 'Old Post',
      handle: 'oldpost',
    },
    timestamp: Date.now() - 86400000 * 30,
    savedAt: Date.now() - 86400000 * 20,
    archived: true,
    tags: ['tag-1'],
  },
]
