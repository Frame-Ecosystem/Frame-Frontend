"use client"

import { AdminGuard } from "@/app/_auth"
import { AdminShellProvider } from "./_components/admin-shell"
import { AdminSidebar } from "./_components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <AdminShellProvider>
        <div className="bg-background flex min-h-screen">
          <AdminSidebar />
          <main className="min-w-0 flex-1 overflow-auto">
            <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </AdminShellProvider>
    </AdminGuard>
  )
}
