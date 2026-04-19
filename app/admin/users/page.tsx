"use client"

import { useState, useMemo } from "react"
import {
  Users,
  Plus,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../_components/ui/table"
import { Badge } from "../../_components/ui/badge"
import { Button } from "../../_components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../_components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../_components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../_components/ui/dialog"
import { Input } from "../../_components/ui/input"
import { Label } from "../../_components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../_components/ui/select"
import { AdminHeader } from "../_components/admin-header"
import {
  DataTableToolbar,
  DataTablePagination,
  DataTableSkeleton,
  EmptyState,
} from "../_components/data-table"
import { useConfirmDialog } from "../_components/confirm-dialog"
import {
  useAdminUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleBlockUser,
  useResetPassword,
} from "../../_hooks/queries/useAdmin"
import type {
  AdminUser,
  CreateUserDto,
  UpdateUserDto,
} from "../../_types/admin"

const LIMIT = 20

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [resetPwUser, setResetPwUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState("")

  // Debounce search
  const searchTimeout = useMemo(() => {
    return (val: string) => {
      setSearch(val)
      const t = setTimeout(() => {
        setDebouncedSearch(val)
        setPage(1)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [])

  const { data, isLoading } = useAdminUsers({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
  })
  const createMut = useCreateUser()
  const updateMut = useUpdateUser()
  const deleteMut = useDeleteUser()
  const toggleBlock = useToggleBlockUser()
  const resetPw = useResetPassword()
  const { confirm, dialog } = useConfirmDialog()

  const users = data?.data ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  return (
    <>
      <AdminHeader
        title="User Management"
        description="Manage all platform users"
        icon={Users}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create User
          </Button>
        }
      />

      {isLoading ? (
        <DataTableSkeleton />
      ) : (
        <div className="space-y-4">
          <DataTableToolbar
            search={search}
            onSearchChange={searchTimeout}
            searchPlaceholder="Search by name or email..."
          />

          {users.length === 0 ? (
            <EmptyState
              icon={<Users />}
              title="No users found"
              description={
                debouncedSearch ? "Try a different search" : "No users yet"
              }
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const imgUrl =
                      typeof u.profileImage === "string"
                        ? u.profileImage
                        : u.profileImage?.url
                    return (
                      <TableRow key={u._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={imgUrl} />
                              <AvatarFallback>
                                {(u.firstName?.[0] ?? u.email[0]).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {u.firstName
                                  ? `${u.firstName} ${u.lastName ?? ""}`
                                  : u.email}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {u.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.isBlocked ? (
                            <Badge variant="destructive">Blocked</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditUser(u)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setResetPwUser(u)}
                              >
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleBlock.mutate({
                                    id: u._id,
                                    isBlocked: !u.isBlocked,
                                  })
                                }
                              >
                                {u.isBlocked ? (
                                  <>
                                    <ShieldOff className="mr-2 h-4 w-4" />{" "}
                                    Unblock
                                  </>
                                ) : (
                                  <>
                                    <Shield className="mr-2 h-4 w-4" /> Block
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() =>
                                  confirm({
                                    title: "Delete user?",
                                    description: `This will permanently delete ${u.email}. This action cannot be undone.`,
                                    confirmLabel: "Delete",
                                    variant: "destructive",
                                    onConfirm: () =>
                                      deleteMut.mutateAsync(u._id),
                                  })
                                }
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <DataTablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create user dialog */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(d) =>
          createMut.mutateAsync(d).then(() => setCreateOpen(false))
        }
        loading={createMut.isPending}
      />

      {/* Edit user dialog */}
      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(o) => !o && setEditUser(null)}
          onSubmit={(d) =>
            updateMut
              .mutateAsync({ id: editUser._id, data: d })
              .then(() => setEditUser(null))
          }
          loading={updateMut.isPending}
        />
      )}

      {/* Reset password dialog */}
      {resetPwUser && (
        <Dialog
          open={!!resetPwUser}
          onOpenChange={(o) => {
            if (!o) {
              setResetPwUser(null)
              setNewPassword("")
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password — {resetPwUser.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setResetPwUser(null)
                  setNewPassword("")
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!newPassword || resetPw.isPending}
                onClick={() =>
                  resetPw
                    .mutateAsync({
                      userId: resetPwUser._id,
                      newPassword,
                    })
                    .then(() => {
                      setResetPwUser(null)
                      setNewPassword("")
                    })
                }
              >
                {resetPw.isPending ? "Resetting..." : "Reset"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {dialog}
    </>
  )
}

/* ── Create User Dialog ─────────────────────── */

function CreateUserDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSubmit: (data: CreateUserDto) => Promise<void>
  loading: boolean
}) {
  const [form, setForm] = useState<CreateUserDto>({
    email: "",
    password: "",
    type: "client",
  })

  const set = (key: keyof CreateUserDto, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="lounge">Lounge</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={form.firstName ?? ""}
                onChange={(e) => set("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={form.lastName ?? ""}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.phoneNumber ?? ""}
              onChange={(e) => set("phoneNumber", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!form.email || !form.password || loading}
            onClick={() => onSubmit(form)}
          >
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Edit User Dialog ───────────────────────── */

function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  user: AdminUser
  open: boolean
  onOpenChange: (o: boolean) => void
  onSubmit: (data: UpdateUserDto) => Promise<void>
  loading: boolean
}) {
  const [form, setForm] = useState<UpdateUserDto>({
    email: user.email,
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    phoneNumber: user.phoneNumber ?? "",
    type: user.type,
  })

  const set = (key: keyof UpdateUserDto, val: string) =>
    setForm((f) => ({ ...f, [key]: val }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="lounge">Lounge</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={form.firstName ?? ""}
                onChange={(e) => set("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={form.lastName ?? ""}
                onChange={(e) => set("lastName", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.phoneNumber ?? ""}
              onChange={(e) => set("phoneNumber", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={() => onSubmit(form)}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
