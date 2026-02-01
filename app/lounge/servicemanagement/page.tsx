"use client"

import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { Input } from "../../_components/ui/input"
import { Label } from "../../_components/ui/label"
import { Textarea } from "../../_components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../_components/ui/dialog"
import { Badge } from "../../_components/ui/badge"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { loungeService, serviceCategoryService, serviceService } from "../../_services"
import SuggestService from "../../_components/SuggestService"
import type { Service, ServiceCategory } from "../../_types"

export default function LoungeServiceManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [globalServices, setGlobalServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    selectedServiceId: '',
    price: '',
    name: '',
    description: '',
    baseDuration: '',
    gender: '',
    status: 'active'
  })
  

  useEffect(() => {
    if (!isLoading && (!user || user.type !== 'lounge')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    loadServices()
    loadCategories()
    loadGlobalServices()
  }, [])

  const loadGlobalServices = async () => {
    try {
      const data = await serviceService.getAll()
      setGlobalServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load global services:', error)
      setGlobalServices([])
    }
  }

  const loadServices = async () => {
    try {
      const data = await loungeService.getAll()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load lounge services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await serviceCategoryService.getAll()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load categories:', error)
      setCategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!editingService && !formData.selectedServiceId) {
      toast.error('Please select a global service')
      return
    }

    try {
      if (editingService) {
        const serviceData = {
          description: formData.description || undefined,
          baseDuration: formData.baseDuration ? parseInt(formData.baseDuration) : undefined,
          status: formData.status
        }
        await loungeService.update(editingService.id, serviceData)
        toast.success("Service updated successfully")
      } else {
        const payload = {
          loungeId: (user as any)?._id || user?.id || '',
          serviceId: formData.selectedServiceId,
          price: formData.price ? parseFloat(formData.price) : undefined,
          duration: formData.baseDuration ? parseInt(formData.baseDuration) : undefined,
          description: formData.description || undefined,
          gender: formData.gender || undefined,
          isActive: formData.status === 'active'
        }

        await loungeService.createLoungeService(payload)
        toast.success("Lounge service added successfully")
      }

      setDialogOpen(false)
      resetForm()
      loadServices()
    } catch (error) {
      console.error('Failed to save lounge service:', error)
      if (error instanceof Error) {
        const anyErr = error as any
        // Handle structured API error from backend
        if (anyErr.code === 'BAD_REQUEST') {
          setError(error.message)
          toast.error(error.message)
        } else {
          toast.error(error.message)
        }
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const handleEdit = (service: Service) => {
    if (!service.id) {
      toast.error("Cannot edit service: Invalid ID")
      return
    }
    setEditingService(service)
    setFormData({
      selectedServiceId: '',
      price: '',
      description: service.description || '',
      baseDuration: service.baseDuration?.toString() || '',
      gender: (service as any).gender || '',
      status: service.status || 'active'
    })
    setError(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      toast.error("Cannot delete service: Invalid ID")
      return
    }
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      await loungeService.delete(id)
      loadServices()
      toast.success("Service deleted successfully")
    } catch (error) {
      console.error('Failed to delete lounge service:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to delete service')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      selectedServiceId: '',
      price: '',
      name: '',
      description: '',
      baseDuration: '',
      gender: '',
      status: 'active'
    })
    setEditingService(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setError(null)
    setDialogOpen(true)
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading lounge service management...</p>
        </div>
      </div>
    )
  }

  if (!user || user.type !== 'lounge') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/lounge')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Lounge Dashboard
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Lounge Service Management</h1>
          <p className="text-muted-foreground">Manage services for this lounge</p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Services</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="selectedServiceId">Choose existing global service</Label>
                    <select
                      id="selectedServiceId"
                      value={formData.selectedServiceId}
                      onChange={(e) => {
                        const sid = e.target.value
                        if (!sid) {
                          setFormData(prev => ({ ...prev, selectedServiceId: '', name: '', description: '', baseDuration: '' }))
                          return
                        }
                        const svc = globalServices.find(s => (s as any)._id === sid || s.id === sid)
                        if (svc) {
                          setFormData(prev => ({
                            ...prev,
                            selectedServiceId: sid,
                            name: svc.name || '',
                            description: svc.description || '',
                            baseDuration: svc.baseDuration ? String(svc.baseDuration) : prev.baseDuration
                          }))
                        } else {
                          setFormData(prev => ({ ...prev, selectedServiceId: sid }))
                        }
                      }}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">(optional) Select a global service</option>
                      {globalServices.map(gs => (
                        <option key={(gs as any)._id || gs.id} value={(gs as any)._id || gs.id}>{gs.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name removed for lounge form — use existing global service selection */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                    <div>
                      <Label htmlFor="price">Price (cents)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                  {/* category is not an attribute for lounge-specific services */}
                  <div>
                    <Label htmlFor="baseDuration">Base Duration (minutes)</Label>
                    <Input
                      id="baseDuration"
                      type="number"
                      min="1"
                      value={formData.baseDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, baseDuration: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Target Gender</Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">No target</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingService ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            {/* SuggestService component handles the suggestion dialog */}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Service Name</th>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium">Duration</th>
                    <th className="text-left p-4 font-medium">Gender</th>
                    <th className="text-left p-4 font-medium">isActive</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(services) && services.map((service) => (
                    <tr key={`service-${service.id}`} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{service.name}</td>
                      <td className="p-4">{service.description || '-'}</td>
                      <td className="p-4">{(service as any).price ? `${(service as any).price} dinar` : '-'}</td>
                      <td className="p-4">{(service as any).duration ? `${(service as any).duration} min` : '-'}</td>
                      <td className="p-4">{(service as any).gender || '-'}</td>
                      <td className="p-4">
                        <Badge variant={(service as any).isActive ? "default" : "secondary"}>
                          {(service as any).isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!Array.isArray(services) || services.length === 0) && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        {loading ? 'Loading services...' : 'No services found. Create your first service to get started.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Didn't find a service?</p>
              <div>
                <SuggestService />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
