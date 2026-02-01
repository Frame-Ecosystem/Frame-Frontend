"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { toast } from "sonner"
import { apiClient } from "../_services"
import { useAuth } from "../_providers/auth"

export default function SuggestService() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    estimatedPrice: '',
    estimatedDuration: '',
    targetGender: ''
    // category removed per schema
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = {
        name: form.name,
        description: form.description
      }
      if (form.estimatedPrice) payload.estimatedPrice = Number(form.estimatedPrice)
      if (form.estimatedDuration) payload.estimatedDuration = Number(form.estimatedDuration)
      if (form.targetGender) payload.targetGender = form.targetGender
      if (user && user.type === 'lounge') {
        payload.loungeId = (user as any)?._id || user.id
      }

      await apiClient.post('/v1/service-suggestions', payload)
      toast.success('Suggestion submitted')
      setOpen(false)
      setForm({ name: '', description: '', estimatedPrice: '', estimatedDuration: '', targetGender: '' })
    } catch (err) {
      console.error('Failed to submit suggestion', err)
      toast.error('Failed to submit suggestion')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">Suggest a service</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suggest a New Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="s-name">Name *</Label>
            <Input id="s-name" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="s-desc">Description *</Label>
            <Textarea id="s-desc" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="s-price">Estimated Price (cents)</Label>
              <Input id="s-price" type="number" value={form.estimatedPrice} onChange={(e) => setForm(prev => ({ ...prev, estimatedPrice: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="s-duration">Estimated Duration (minutes)</Label>
              <Input id="s-duration" type="number" value={form.estimatedDuration} onChange={(e) => setForm(prev => ({ ...prev, estimatedDuration: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="s-target">Target Gender</Label>
            <select
              id="s-target"
              value={form.targetGender}
              onChange={(e) => setForm(prev => ({ ...prev, targetGender: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">No target</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
              <option value="kids">Kids</option>
            </select>
          </div>
          {/* category removed per schema */}
          {/* estimatedPrice, estimatedDuration, targetGender removed per schema */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Submit Suggestion</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
