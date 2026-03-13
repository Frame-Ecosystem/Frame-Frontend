"use client"

import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { Badge } from "../../_components/ui/badge"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { loungeService, serviceCategoryService } from "../../_services"
import { serviceSuggestionsService } from "../../_services"
import { isAuthError } from "../../_services/api"
import { ApprovalDialog } from "./_components/approval-dialog"

export default function AdminServiceSuggestionsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean
    suggestion: any | null
  }>({ open: false, suggestion: null })
  const [approvalForm, setApprovalForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    duration: "",
    gender: "",
    adminNote: "",
  })

  useEffect(() => {
    if (!isLoading && (!user || user.type !== "admin")) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    loadSuggestions()
    loadCategories()
  }, [])

  const loadSuggestions = async () => {
    try {
      const { suggestions } = await loungeService.getServiceSuggestions()
      setSuggestions(suggestions)
    } catch (err) {
      if (isAuthError(err)) return
      console.error("Failed to load suggestions", err)
      toast.error("Failed to load suggestions")
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await serviceCategoryService.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      if (isAuthError(err)) return
      console.error("Failed to load categories:", err)
      setCategories([])
    }
  }

  const handleApprove = (suggestion: any) => {
    setApprovalForm({
      name: suggestion.name || "",
      categoryId: "",
      price: suggestion.estimatedPrice?.toString() || "",
      duration: suggestion.estimatedDuration?.toString() || "",
      gender: suggestion.targetGender || "",
      adminNote: "",
    })
    setApproveDialog({ open: true, suggestion })
  }

  const handleReject = async (suggestion: any) => {
    if (!confirm(`Are you sure you want to reject "${suggestion.name}"?`))
      return

    try {
      await serviceSuggestionsService.adminUpdateServiceSuggestionStatus(
        suggestion._id,
        {
          status: "rejected",
          adminNote: "Rejected by administrator",
        },
      )

      toast.success("Suggestion rejected successfully")
      loadSuggestions() // Refresh the list
    } catch (err) {
      if (isAuthError(err)) return
      console.error("Failed to reject suggestion", err)
      toast.error("Failed to reject suggestion")
    }
  }

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!approveDialog.suggestion) return

    // Validate required fields
    if (!approvalForm.name || !approvalForm.name.trim()) {
      toast.error("Please enter a service name")
      return
    }
    if (!approvalForm.categoryId) {
      toast.error("Please select a category")
      return
    }

    try {
      const updateData = {
        status: "implemented" as const,
        name: approvalForm.name.trim(),
        categoryId: approvalForm.categoryId,
        price: approvalForm.price ? parseFloat(approvalForm.price) : undefined,
        duration: approvalForm.duration
          ? parseInt(approvalForm.duration)
          : undefined,
        gender: (approvalForm.gender as any) || undefined,
        adminNote: approvalForm.adminNote.trim() || undefined,
      }

      await serviceSuggestionsService.adminUpdateServiceSuggestionStatus(
        approveDialog.suggestion._id,
        updateData,
      )

      toast.success("Suggestion approved and service created successfully")
      setApproveDialog({ open: false, suggestion: null })
      loadSuggestions() // Refresh the list
    } catch (err) {
      if (isAuthError(err)) return
      console.error("Failed to approve suggestion", err)
      toast.error("Failed to approve suggestion")
    }
  }

  if (isLoading || loading) return null
  if (!user || user.type !== "admin") return null

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Button>
          <h1 className="mb-2 text-3xl font-bold lg:text-4xl">
            Service Suggestions
          </h1>
          <p className="text-muted-foreground">
            User-submitted service suggestions
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Name</th>
                    <th className="p-4 text-left font-medium">Description</th>
                    <th className="p-4 text-left font-medium">Category</th>
                    <th className="p-4 text-left font-medium">
                      Estimated Price
                    </th>
                    <th className="p-4 text-left font-medium">
                      Estimated Duration
                    </th>
                    <th className="p-4 text-left font-medium">Target Gender</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Lounge</th>
                    <th className="p-4 text-left font-medium">Admin Notes</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-muted-foreground p-4 text-center"
                      >
                        No suggestions found.
                      </td>
                    </tr>
                  )}
                  {suggestions.map((s) => (
                    <tr key={s._id} className="hover:bg-muted/50 border-b">
                      <td className="p-4 font-medium">{s.name}</td>
                      <td className="p-4">{s.description || "-"}</td>
                      <td className="p-4">{s.category || "-"}</td>
                      <td className="p-4">
                        {s.estimatedPrice ? `${s.estimatedPrice} dt` : "-"}
                      </td>
                      <td className="p-4">
                        {s.estimatedDuration
                          ? `${s.estimatedDuration} min`
                          : "-"}
                      </td>
                      <td className="p-4">{s.targetGender || "-"}</td>
                      <td className="p-4">
                        <Badge>{s.status || "PENDING"}</Badge>
                      </td>
                      <td className="p-4">
                        {s.loungeId?.email || s.loungeId?._id || "-"}
                      </td>
                      <td
                        className="max-w-xs truncate p-4"
                        title={s.adminNote || s.adminNotes || "-"}
                      >
                        {s.adminNote || s.adminNotes || "-"}
                      </td>
                      <td className="p-4">
                        {s.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApprove(s)}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(s)}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Dialog */}
      <ApprovalDialog
        open={approveDialog.open}
        suggestion={approveDialog.suggestion}
        categories={categories}
        approvalForm={approvalForm}
        onFormChange={setApprovalForm}
        onSubmit={handleApprovalSubmit}
        onClose={() => setApproveDialog({ open: false, suggestion: null })}
      />
    </div>
  )
}
