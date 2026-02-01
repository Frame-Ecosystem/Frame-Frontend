"use client"

import { useAuth } from "../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../_components/ui/card"
import { Button } from "../_components/ui/button"
import { Users, BarChart3, Settings, Shield, Activity, Scissors } from "lucide-react"

export default function AdminDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.type !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || user.type !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your barber lab platform</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">567</div>
              <p className="text-sm text-muted-foreground">Active Barbers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">8,901</div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">User Management</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage users, barbers, and clients across the platform
              </p>
              <Button className="w-full" variant="outline">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Analytics</CardTitle>
              <BarChart3 className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View platform statistics and performance metrics
              </p>
              <Button className="w-full" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">System Settings</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Configure platform-wide settings and preferences
              </p>
              <Button className="w-full" variant="outline">
                System Settings
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Security</CardTitle>
              <Shield className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Monitor security events and manage access controls
              </p>
              <Button className="w-full" variant="outline">
                Security Center
              </Button>
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Activity Logs</CardTitle>
              <Activity className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Review system activity and audit trails
              </p>
              <Button className="w-full" variant="outline">
                View Logs
              </Button>
            </CardContent>
          </Card>

          {/* Service Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Service Management</CardTitle>
              <Scissors className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage available services across the platform
              </p>
              <Button className="w-full" variant="outline" onClick={() => router.push('/admin/servicemanagement')}>
                Manage Services
              </Button>
            </CardContent>
          </Card>

          {/* Service Category Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Service Categories</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground ml-auto" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage service categories for organizing services
              </p>
              <Button className="w-full" variant="outline" onClick={() => router.push('/admin/servicecategories')}>
                Manage Categories
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}