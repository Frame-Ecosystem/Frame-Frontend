"use client"

import { useState } from "react"
import {
  Server,
  Activity,
  RefreshCw,
  Database,
  Clock,
  Cpu,
  HardDrive,
  Key,
  Download,
  Trash2,
} from "lucide-react"
import { useTranslation } from "@/app/_i18n"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
import { Badge } from "../../_components/ui/badge"
import { Button } from "../../_components/ui/button"
import { Input } from "../../_components/ui/input"
import { Label } from "../../_components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../_components/ui/dialog"
import { AdminHeader } from "../_components/admin-header"
import { StatCard, StatCardSkeleton } from "../_components/stat-card"
import {
  useSystemStats,
  useSystemHealth,
  useActivityLog,
  useClearSessions,
  useResetPassword,
  useExportUserData,
} from "../../_hooks/queries/useAdmin"

function formatBytes(bytes: number) {
  const mb = bytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

export default function SystemPage() {
  const { t } = useTranslation()
  const { data: stats, isLoading: statsLoading } = useSystemStats()
  const { data: health } = useSystemHealth()
  const { data: logData, isLoading: logLoading } = useActivityLog(50)
  const clearSessions = useClearSessions()
  const resetPw = useResetPassword()
  const exportData = useExportUserData()

  const [toolUserId, setToolUserId] = useState("")
  const [toolPw, setToolPw] = useState("")
  const [pwDialogOpen, setPwDialogOpen] = useState(false)

  const sysStats = stats?.data
  const sysHealth = health?.data
  const logs = logData?.data ?? []

  return (
    <>
      <AdminHeader
        title={t("admin.system.title")}
        description={t("admin.system.desc")}
        icon={Server}
      />

      {/* System stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title={t("admin.system.totalUsers")}
              value={sysStats?.totalUsers ?? 0}
              icon={Database}
            />
            <StatCard
              title={t("admin.system.clients")}
              value={sysStats?.clients ?? 0}
              icon={Activity}
            />
            <StatCard
              title={t("admin.system.lounges")}
              value={sysStats?.lounges ?? 0}
              icon={HardDrive}
            />
            <StatCard
              title={t("admin.system.agents")}
              value={sysStats?.agents ?? 0}
              icon={Cpu}
            />
          </>
        )}
      </div>

      {/* Health */}
      {sysHealth && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> {t("admin.system.systemHealth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  {t("admin.system.database")}
                </p>
                <Badge
                  variant={
                    sysHealth.database === "connected"
                      ? "default"
                      : "destructive"
                  }
                >
                  {sysHealth.database}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  {t("admin.system.memoryHeap")}
                </p>
                <p className="font-mono text-sm font-medium">
                  {sysHealth.memoryUsage
                    ? `${formatBytes(sysHealth.memoryUsage.heapUsed)} / ${formatBytes(sysHealth.memoryUsage.heapTotal)}`
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  {t("admin.system.uptime")}
                </p>
                <p className="flex items-center gap-1 font-mono text-sm font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {formatUptime(sysHealth.uptime)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("admin.system.adminTools")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder={t("admin.system.userIdPlaceholder")}
                value={toolUserId}
                onChange={(e) => setToolUserId(e.target.value)}
                className="w-56"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!toolUserId || clearSessions.isPending}
                onClick={() =>
                  clearSessions.mutate(toolUserId, {
                    onSuccess: () => setToolUserId(""),
                  })
                }
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />{" "}
                {t("admin.system.clearSessions")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!toolUserId}
                onClick={() => setPwDialogOpen(true)}
              >
                <Key className="mr-1.5 h-3.5 w-3.5" />{" "}
                {t("admin.system.resetPassword")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!toolUserId || exportData.isPending}
                onClick={() => exportData.mutate(toolUserId)}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />{" "}
                {t("admin.system.exportData")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset password dialog */}
      <Dialog
        open={pwDialogOpen}
        onOpenChange={(o) => {
          setPwDialogOpen(o)
          if (!o) setToolPw("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.system.resetPassword")}</DialogTitle>
            <DialogDescription>
              {t("admin.system.resetPasswordDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Label>{t("admin.system.newPassword")}</Label>
            <Input
              type="password"
              value={toolPw}
              onChange={(e) => setToolPw(e.target.value)}
              placeholder={t("admin.system.enterNewPassword")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              disabled={!toolPw || resetPw.isPending}
              onClick={() =>
                resetPw
                  .mutateAsync({ userId: toolUserId, newPassword: toolPw })
                  .then(() => {
                    setPwDialogOpen(false)
                    setToolPw("")
                  })
              }
            >
              {t("common.reset")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RefreshCw className="h-4 w-4" /> {t("admin.system.recentActivity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logLoading ? (
            <p className="text-muted-foreground text-sm">
              {t("admin.system.loadingLogs")}
            </p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("admin.system.noActivity")}
            </p>
          ) : (
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log._id}
                  className="border-border flex items-start justify-between rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    {log.details && (
                      <p className="text-muted-foreground max-w-lg truncate text-xs">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
