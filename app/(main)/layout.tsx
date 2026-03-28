import { DataProvider } from '@/lib/context/data-context'
import { SidebarNav, MobileNav } from '@/components/nav/sidebar-nav'

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
          {children}
        </main>
        <MobileNav />
      </div>
    </DataProvider>
  )
}
