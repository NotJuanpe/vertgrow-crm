import { Sidebar, MobileNav } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Right column: header + content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
