'use client'

import { useState, useRef } from 'react'
import { TopBar } from '@/components/nav/top-bar'
import { useData } from '@/lib/context/data-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { importFromJSON, exportToJSON, downloadJSON } from '@/lib/import-export'
import { MOCK_BOOKMARKS, MOCK_TAGS } from '@/lib/mock-data'
import * as bookmarkStorage from '@/lib/storage/bookmarks'
import * as tagStorage from '@/lib/storage/tags'
import {
  Upload,
  Download,
  FileJson,
  Trash2,
  Tag as TagIcon,
  Bookmark,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Palette,
} from 'lucide-react'
import { ThemeSelector } from '@/components/theme-selector'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { TagColor, TAG_COLORS } from '@/types'

const tagColorClasses: Record<TagColor, string> = {
  blue: 'bg-tag-blue',
  green: 'bg-tag-green',
  yellow: 'bg-tag-yellow',
  red: 'bg-tag-red',
  purple: 'bg-tag-purple',
  cyan: 'bg-tag-cyan',
  orange: 'bg-tag-orange',
  pink: 'bg-tag-pink',
}

export default function SettingsPage() {
  const { tags, bookmarks, archivedBookmarks, refreshData, deleteTag, updateTag } = useData()
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalBookmarks = bookmarks.length + archivedBookmarks.length

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const content = await file.text()
      const result = await importFromJSON(content)

      if (result.success) {
        await refreshData()
        toast.success(
          `Imported ${result.imported} bookmarks${
            result.duplicates > 0 ? ` (${result.duplicates} duplicates skipped)` : ''
          }`
        )
      } else {
        toast.error(result.errors[0] || 'Failed to import')
      }
    } catch (error) {
      toast.error('Failed to read file')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const json = await exportToJSON()
      const filename = `bloomscroll-export-${new Date().toISOString().split('T')[0]}.json`
      downloadJSON(json, filename)
      toast.success('Export downloaded')
    } catch (error) {
      toast.error('Failed to export')
    } finally {
      setIsExporting(false)
    }
  }

  const handleLoadDemo = async () => {
    setIsLoadingDemo(true)
    try {
      // Import mock tags first
      for (const tag of MOCK_TAGS) {
        try {
          await tagStorage.createTag(tag.name, tag.color)
        } catch {
          // Tag may already exist
        }
      }

      // Import mock bookmarks
      const result = await bookmarkStorage.importBookmarks(
        MOCK_BOOKMARKS.map((b) => ({
          url: b.url,
          text: b.text,
          author: b.author,
          timestamp: b.timestamp,
          media: b.media,
        }))
      )

      // Update bookmark tags
      await refreshData()

      toast.success(`Loaded ${result.imported} demo bookmarks`)
    } catch (error) {
      toast.error('Failed to load demo data')
    } finally {
      setIsLoadingDemo(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all bookmarks? This cannot be undone.')) {
      return
    }

    setIsDeletingAll(true)
    try {
      const all = await bookmarkStorage.exportBookmarks()
      for (const bookmark of all) {
        await bookmarkStorage.deleteBookmark(bookmark.id)
      }
      await refreshData()
      toast.success('All bookmarks deleted')
    } catch (error) {
      toast.error('Failed to delete bookmarks')
    } finally {
      setIsDeletingAll(false)
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId)
      toast.success('Tag deleted')
    } catch (error) {
      toast.error('Failed to delete tag')
    }
  }

  const handleUpdateTagColor = async (tagId: string, color: TagColor) => {
    try {
      await updateTag(tagId, { color })
    } catch (error) {
      toast.error('Failed to update tag')
    }
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar title="Settings" showFilters={false} showCount={false} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {/* Theme */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            <ThemeSelector />
          </Card>

          {/* Stats */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Your Library</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-4">
                <Bookmark className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{totalBookmarks}</span>
                <span className="text-xs text-muted-foreground">Bookmarks</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-4">
                <TagIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{tags.length}</span>
                <span className="text-xs text-muted-foreground">Tags</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-xl bg-muted p-4">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{archivedBookmarks.length}</span>
                <span className="text-xs text-muted-foreground">Archived</span>
              </div>
            </div>
          </Card>

          {/* Import/Export */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Import & Export</h2>
            <div className="flex flex-col gap-4">
              {/* Import */}
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  Import bookmarks from X/Twitter export or BloomScroll backup
                </p>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Import JSON
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleExport}
                    disabled={isExporting || totalBookmarks === 0}
                  >
                    {isExporting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Export All
                  </Button>
                </div>
              </div>

              {/* Demo data */}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Try BloomScroll with sample bookmarks
                </p>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={handleLoadDemo}
                  disabled={isLoadingDemo}
                >
                  {isLoadingDemo ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Load Demo Data
                </Button>
              </div>
            </div>
          </Card>

          {/* Manage Tags */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Manage Tags</h2>
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tags yet. Create tags from the filter bar above.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'h-3 w-3 rounded-full',
                          tagColorClasses[tag.color]
                        )}
                      />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Color picker */}
                      <div className="flex gap-1">
                        {TAG_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => handleUpdateTagColor(tag.id, color)}
                            className={cn(
                              'h-5 w-5 rounded-full transition-all',
                              tagColorClasses[color],
                              tag.color === color
                                ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background'
                                : 'opacity-50 hover:opacity-100'
                            )}
                            aria-label={`Change to ${color}`}
                          />
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteTag(tag.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30 p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Danger Zone</h2>
            </div>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              These actions cannot be undone. Export your data first.
            </p>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={handleDeleteAll}
              disabled={isDeletingAll || totalBookmarks === 0}
            >
              {isDeletingAll ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete All Bookmarks
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
