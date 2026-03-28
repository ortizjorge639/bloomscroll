import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BloomScroll',
    short_name: 'BloomScroll',
    description: 'Transform your X bookmarks into a beautiful, TikTok-style knowledge feed',
    start_url: '/feed',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    categories: ['productivity', 'social'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Feed',
        short_name: 'Feed',
        description: 'Open your bookmark feed',
        url: '/feed',
      },
      {
        name: 'Settings',
        short_name: 'Settings',
        description: 'Open settings',
        url: '/settings',
      },
    ],
  }
}
