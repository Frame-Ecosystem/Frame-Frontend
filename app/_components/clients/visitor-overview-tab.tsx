import { User as UserIcon, Mail, Phone, Calendar } from "lucide-react"
import { Card, CardContent } from "@/app/_components/ui/card"
import type { ClientProfile } from "@/app/_types"
import { getDisplayName } from "./utils"

interface VisitorOverviewTabProps {
  profile: ClientProfile
}

const INFO_FIELDS = [
  {
    key: "name" as const,
    icon: UserIcon,
    getValue: (p: ClientProfile) => getDisplayName(p),
    show: (p: ClientProfile) => !!(p.firstName || p.lastName),
  },
  {
    key: "email" as const,
    icon: Mail,
    getValue: (p: ClientProfile) => p.email ?? "",
    show: (p: ClientProfile) => !!p.email,
  },
  {
    key: "phone" as const,
    icon: Phone,
    getValue: (p: ClientProfile) => p.phoneNumber ?? "",
    show: (p: ClientProfile) => !!p.phoneNumber,
  },
  {
    key: "memberSince" as const,
    icon: Calendar,
    getValue: (p: ClientProfile) =>
      `Member since ${new Date(p.createdAt!).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`,
    show: (p: ClientProfile) => !!p.createdAt,
  },
]

export function VisitorOverviewTab({ profile }: VisitorOverviewTabProps) {
  return (
    <Card className="bg-card border shadow-sm">
      <CardContent className="p-4 sm:p-6">
        <h3 className="mb-4 text-lg font-semibold">About</h3>
        <div className="space-y-3">
          {INFO_FIELDS.filter((f) => f.show(profile)).map((field) => (
            <div key={field.key} className="flex items-center gap-3 text-sm">
              <field.icon className="text-muted-foreground h-4 w-4" />
              <span>{field.getValue(profile)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
