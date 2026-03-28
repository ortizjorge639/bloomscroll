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
    url: 'https://medium.com/@karpathy/a-recipe-for-training-neural-networks-2135380279c0',
    text: 'A Recipe for Training Neural Networks - Best practices for training deep learning models. Start simple, measure everything, iterate fast. The best models are built through thousands of small experiments, not grand architectural decisions.',
    author: {
      name: 'Andrej Karpathy',
      handle: 'karpathy',
    },
    timestamp: Date.now() - 3600000 * 2,
    savedAt: Date.now() - 3600000,
    archived: false,
    tags: ['tag-1', 'tag-3'],
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        alt: 'AI and neural networks',
      },
    ],
    linkPreview: {
      title: 'A Recipe for Training Neural Networks',
      description: 'Some personal notes on how to effectively train neural networks.',
      image: 'https://miro.medium.com/max/1400/1*-xjW-HNLf1v4pD9CHpYyqA.png',
    },
  },
  {
    id: 'bm-2',
    url: 'https://nav.al/specific-knowledge',
    text: 'Specific Knowledge is found by pursuing your genuine curiosity and passion rather than whatever is hot right now. Building specific knowledge will feel like play to you but will look like work to others.',
    author: {
      name: 'Naval Ravikant',
      handle: 'naval',
    },
    timestamp: Date.now() - 3600000 * 5,
    savedAt: Date.now() - 3600000 * 2,
    archived: false,
    tags: ['tag-4'],
    linkPreview: {
      title: 'Specific Knowledge',
      description: 'How to build specific knowledge for a better career and life.',
    },
  },
  {
    id: 'bm-3',
    url: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    text: 'Nielsen\'s 10 Usability Heuristics for User Interface Design. The best interfaces disappear. If users are thinking about your UI, you have failed. They should be thinking about their goals, their content, their next action. Your job is to be invisible.',
    author: {
      name: 'Jakob Nielsen',
      handle: 'nngroup',
    },
    timestamp: Date.now() - 3600000 * 8,
    savedAt: Date.now() - 3600000 * 4,
    archived: false,
    tags: ['tag-2', 'tag-5'],
    linkPreview: {
      title: 'Ten Usability Heuristics for User Interface Design',
      description: 'Fundamental principles for excellent user interface design that still hold true today.',
    },
  },
  {
    id: 'bm-4',
    url: 'https://blog.samaltman.com/how-to-succeed-as-an-operator',
    text: 'How to Succeed as an Operator - Most people overestimate what they can do in a year and underestimate what they can do in a decade. The trick is to pick something you can compound at. Skills compound. Relationships compound. Knowledge compounds.',
    author: {
      name: 'Sam Altman',
      handle: 'sama',
    },
    timestamp: Date.now() - 86400000,
    savedAt: Date.now() - 3600000 * 12,
    archived: false,
    tags: ['tag-1', 'tag-4'],
    linkPreview: {
      title: 'How to Succeed as an Operator',
      description: 'Insights on being an effective operator and building lasting success.',
    },
  },
  {
    id: 'bm-5',
    url: 'https://vercel.com/blog/web-platform-2024',
    text: 'The future of web development in 2024:\n\n1. AI-assisted coding is becoming standard\n2. Edge-first deployment for lower latency\n3. Real-time collaboration everywhere\n4. Zero-config tools and frameworks\n\nWe are building the platform for all of this at Vercel.',
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
        alt: 'Modern web development code',
      },
    ],
    linkPreview: {
      title: 'The Future of Web Development',
      description: 'Exploring the latest trends and technologies shaping web development.',
    },
  },
  {
    id: 'bm-6',
    url: 'https://www.paulgraham.com/ideas.html',
    text: 'How to Get Startup Ideas - The way to get startup ideas is not to try to think of startup ideas. It is to look for problems, preferably problems you have yourself. The very best startup ideas tend to have three things in common: they are something the founders themselves want, that they themselves can build, and that few others realize are worth doing.',
    author: {
      name: 'Paul Graham',
      handle: 'paulg',
    },
    timestamp: Date.now() - 86400000 * 3,
    savedAt: Date.now() - 86400000 * 1.5,
    archived: false,
    tags: ['tag-4'],
    linkPreview: {
      title: 'How to Get Startup Ideas',
      description: 'Paul Graham\'s classic essay on finding and validating startup ideas.',
    },
  },
  {
    id: 'bm-7',
    url: 'https://www.intercom.com/blog/design-for-impact/',
    text: 'Design for Impact - After studying successful products for 10 years:\n\nSimple beats Complex\nFast beats Perfect\nShipped beats Planned\nUser feedback beats Your opinion\nSmall iterations beat Big launches\n\nThe best products are obvious in hindsight.',
    author: {
      name: 'Des Traynor',
      handle: 'destraynor',
    },
    timestamp: Date.now() - 86400000 * 4,
    savedAt: Date.now() - 86400000 * 2,
    archived: false,
    tags: ['tag-5', 'tag-2'],
    linkPreview: {
      title: 'Design for Impact',
      description: 'Principles for designing products that matter and make a real difference.',
    },
  },
  {
    id: 'bm-8',
    url: 'https://www.youtube.com/watch?v=N640SmGeLjA',
    text: 'First Principles Thinking - Physics is the law, everything else is a recommendation. Start from first principles. Question every assumption. If you cannot explain something simply, you do not understand it well enough. Applied to innovation and problem-solving.',
    author: {
      name: 'Tim Urban / Wait But Why',
      handle: 'waitbutwhy',
    },
    timestamp: Date.now() - 86400000 * 5,
    savedAt: Date.now() - 86400000 * 3,
    archived: false,
    tags: ['tag-3', 'tag-1'],
    linkPreview: {
      title: 'First Principles Thinking',
      description: 'Understand how to think about problems from the ground up using first principles.',
    },
  },
]

export const MOCK_ARCHIVED_BOOKMARKS: Bookmark[] = [
  {
    id: 'bm-archived-1',
    url: 'https://www.ycombinator.com/library/4D-how-to-read-an-academic-paper',
    text: 'How to Read an Academic Paper - A guide to efficiently reading and understanding research papers. This bookmark has been archived after review.',
    author: {
      name: 'Y Combinator',
      handle: 'ycombinator',
    },
    timestamp: Date.now() - 86400000 * 30,
    savedAt: Date.now() - 86400000 * 20,
    archived: true,
    tags: ['tag-1'],
    linkPreview: {
      title: 'How to Read an Academic Paper',
      description: 'Effective strategies for reading and understanding research papers.',
    },
  },
]
