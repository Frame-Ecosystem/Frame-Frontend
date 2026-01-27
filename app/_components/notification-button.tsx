"use client"

import { Bell } from "lucide-react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"
import { useState } from "react"
import { useAuth } from "../_providers/auth"

interface NotificationButtonProps {
  unreadCount?: number
}

const NotificationButton = ({ unreadCount = 0 }: NotificationButtonProps) => {
  const { user, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  // Don't render if user is not logged in or still loading
  if (isLoading || !user) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-primary/10 relative rounded-full h-12 w-12 p-0"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            {unreadCount === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                {/* Placeholder for actual notifications */}
                <div className="space-y-3">
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="font-medium text-foreground">Booking Confirmed</p>
                    <p className="text-sm">Your appointment with John&apos;s Barbershop has been confirmed for tomorrow at 2:00 PM.</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <p className="font-medium text-foreground">New Message</p>
                    <p className="text-sm">You have a new message from your barber.</p>
                    <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                View All Notifications
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationButton