/* eslint-disable no-unused-vars */
"use client"

import { Button } from "../../../_components/ui/button"
import { Input } from "../../../_components/ui/input"
import { Label } from "../../../_components/ui/label"
import { Textarea } from "../../../_components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../_components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../_components/ui/select"

interface ApprovalDialogProps {
  open: boolean
  suggestion: any | null
  categories: any[]
  approvalForm: {
    name: string
    categoryId: string
    price: string
    duration: string
    gender: string
    adminNote: string
  }
  onFormChange: (form: ApprovalDialogProps["approvalForm"]) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export function ApprovalDialog({
  open,
  suggestion,
  categories,
  approvalForm,
  onFormChange,
  onSubmit,
  onClose,
}: ApprovalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Service Suggestion</DialogTitle>
          <DialogDescription>
            Approve &quot;{suggestion?.name}&quot; and create the service
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter service name"
              value={approvalForm.name}
              onChange={(e) =>
                onFormChange({ ...approvalForm, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={approvalForm.categoryId}
              onValueChange={(value) =>
                onFormChange({ ...approvalForm, categoryId: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">Price (dt)</Label>
            <Input
              id="price"
              type="number"
              placeholder={
                suggestion?.estimatedPrice?.toString() || "Enter price"
              }
              value={approvalForm.price}
              onChange={(e) =>
                onFormChange({ ...approvalForm, price: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder={
                suggestion?.estimatedDuration?.toString() || "Enter duration"
              }
              value={approvalForm.duration}
              onChange={(e) =>
                onFormChange({ ...approvalForm, duration: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={approvalForm.gender}
              onValueChange={(value) =>
                onFormChange({ ...approvalForm, gender: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={suggestion?.targetGender || "Select gender"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
                <SelectItem value="kids">Kids</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="adminNote">Admin Note</Label>
            <Textarea
              id="adminNote"
              placeholder="Optional admin notes..."
              value={approvalForm.adminNote}
              onChange={(e) =>
                onFormChange({ ...approvalForm, adminNote: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" variant="success" className="flex-1">
              Approve & Create Service
            </Button>
            <Button type="button" variant="destructive" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
