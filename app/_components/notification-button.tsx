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
          className="hover:bg-primary/10 relative h-12 w-12 rounded-full p-0"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center p-0 text-xs font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-sm">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            {unreadCount === 0 ? (
              <div className="py-8 text-center">
                <Bell className="text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50" />
                <p className="text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                {/* Placeholder for actual notifications */}
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg border p-3">
                    <p className="text-foreground font-medium">
                      Booking Confirmed
                    </p>
                    <p className="text-sm">
                      Your appointment with John&apos;s Center has been
                      confirmed for tomorrow at 2:00 PM.
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      2 hours ago
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg border p-3">
                    <p className="text-foreground font-medium">New Message</p>
                    <p className="text-sm">
                      You have a new message from your center.
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      5 hours ago
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="mt-4 border-t pt-4">
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
