"use client"

import { AdminGuard } from "@/app/_auth"
import { AdminSidebar } from "./_components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl space-y-6 p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
