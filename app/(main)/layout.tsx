import { DataProvider } from '@/lib/context/data-context'
import { SidebarNav } from '@/components/nav/sidebar-nav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DataProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background">
        <SidebarNav />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </DataProvider>
  )
}
