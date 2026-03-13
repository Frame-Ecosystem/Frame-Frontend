"use client"

import { useAuth } from "../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../_components/ui/card"
import { Button } from "../_components/ui/button"
import {
  Users,
  BarChart3,
  Settings,
  Shield,
  Activity,
  Layers,
  Package,
} from "lucide-react"
import { adminService } from "../_services"
import { isAuthError } from "../_services/api"

interface AdminStats {
  totalUsers: number
  onlineUsers: number
  blockedUsers: number
  adminCount: number
  clientCount: number
  loungeCount: number
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchStats = async () => {
      if (user && user.type === "admin") {
        try {
          const data = await adminService.getStats()
          setStats(data)
        } catch (error) {
          if (isAuthError(error)) return
          console.error("Failed to load admin stats:", error)
        } finally {
          setStatsLoading(false)
        }
      }
    }

    fetchStats()
  }, [user])

  if (isLoading) {
    return (
      <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
        <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
          <div className="space-y-6">
            <div className="bg-primary/10 h-9 w-56 animate-pulse rounded" />
            <div className="bg-primary/10 h-4 w-80 animate-pulse rounded" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3 rounded-lg border p-6">
                  <div className="bg-primary/10 h-4 w-20 animate-pulse rounded" />
                  <div className="bg-primary/10 h-8 w-16 animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || user.type !== "admin") {
    return null
  }

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your frame platform</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          {statsLoading ? (
            // Skeleton loading for stats cards
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="bg-muted-foreground/10 mb-2 h-8 w-16 animate-pulse rounded"></div>
                  <div className="bg-muted-foreground/10 h-4 w-20 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">
                    {stats?.totalUsers ?? 0}
                  </div>
                  <p className="text-muted-foreground text-sm">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">
                    {stats?.loungeCount ?? 0}
                  </div>
                  <p className="text-muted-foreground text-sm">Total Lounges</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">
                    {stats?.clientCount ?? 0}
                  </div>
                  <p className="text-muted-foreground text-sm">Total Clients</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">
                    {stats?.onlineUsers ?? 0}
                  </div>
                  <p className="text-muted-foreground text-sm">Online Users</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Service Categories */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Service Categories
              </CardTitle>
              <Layers className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Manage service categories for organizing services
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/admin/servicecategories")}
              >
                Manage Categories
              </Button>
            </CardContent>
          </Card>

          {/* Service Management */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Service Management
              </CardTitle>
              <Package className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Manage available services across the platform
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/admin/servicemanagement")}
              >
                Manage Services
              </Button>
            </CardContent>
          </Card>

          {/* Agent Management */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Agent Management
              </CardTitle>
              <Shield className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Manage agents across all lounges on the platform
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push("/admin/agents")}
              >
                Manage Agents
              </Button>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                User Management
              </CardTitle>
              <Users className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Manage users, lounges, and clients across the platform
              </p>
              <Button className="w-full" variant="outline">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Analytics</CardTitle>
              <BarChart3 className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                View platform statistics and performance metrics
              </p>
              <Button className="w-full" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                System Settings
              </CardTitle>
              <Settings className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Configure platform-wide settings and preferences
              </p>
              <Button className="w-full" variant="outline">
                System Settings
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Security</CardTitle>
              <Shield className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Monitor security events and manage access controls
              </p>
              <Button className="w-full" variant="outline">
                Security Center
              </Button>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Activity Logs
              </CardTitle>
              <Activity className="text-muted-foreground ml-auto h-5 w-5" />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Review system activity and audit trails
              </p>
              <Button className="w-full" variant="outline">
                View Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
