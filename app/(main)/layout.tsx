import { DataProvider } from '@/lib/context/data-context'
import { SidebarNav, MobileNav } from '@/components/nav/sidebar-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { KeyboardShortcutsModal } from '@/components/keyboard-shortcuts-modal'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataProvider>
      <div className="flex h-[100dvh] w-screen overflow-hidden bg-background">
        <SidebarNav />
        <main className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        <MobileNav />
      </div>
      <KeyboardShortcutsModal />
    </DataProvider>
  )
}
