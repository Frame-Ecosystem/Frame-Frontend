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
import { serviceService, serviceCategoryService } from "../../_services"
import type { Service, ServiceCategory } from "../../_types"

export default function ServiceManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    baseDuration: '',
    gender: '',
    status: 'active'
  })

  useEffect(() => {
    if (!isLoading && (!user || user.type !== 'admin')) {
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    loadServices()
    loadCategories()
  }, [])

  const loadServices = async () => {
    try {
      const data = await serviceService.getAll()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load services:', error)
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

    // Check for duplicate names locally (case-insensitive, trim input)
    const nameToCheck = formData.name ? formData.name.trim() : ''
    const nameExists = services.some(service => 
      service.name.toLowerCase() === nameToCheck.toLowerCase() && 
      (!editingService || service.id !== editingService.id)
    )

    if (nameExists) {
      setError('Service name already exists')
      toast.error('Service name already exists')
      return
    }
    
    if (!formData.categoryId) {
      toast.error('Please select a category')
      return
    }

    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        categoryId: formData.categoryId,
        baseDuration: formData.baseDuration ? parseInt(formData.baseDuration) : undefined,
        gender: formData.gender || undefined,
        status: formData.status
      }

      if (editingService) {
        await serviceService.update(editingService.id, serviceData)
        toast.success("Service updated successfully")
      } else {
        await serviceService.create(serviceData)
        toast.success("Service created successfully")
      }

      setDialogOpen(false)
      resetForm()
      loadServices()
    } catch (error) {
      console.error('Failed to save service:', error)
      if (error instanceof Error) {
        toast.error(error.message)
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
      name: service.name,
      description: service.description || '',
      categoryId: typeof service.categoryId === 'object' ? service.categoryId?._id || service.categoryId?.id || '' : service.categoryId || '',
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
      await serviceService.delete(id)
      loadServices()
      toast.success("Service deleted successfully")
    } catch (error) {
      console.error('Failed to delete service:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Failed to delete service')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
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
          <p className="text-muted-foreground">Loading service management...</p>
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
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Service Management</h1>
          <p className="text-muted-foreground">Manage available services across the platform</p>
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
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoryId">Category *</Label>
                    <select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Base Duration</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(services) && services.map((service) => (
                    <tr key={`service-${service.id}`} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{service.name}</td>
                      <td className="p-4">
                        {(() => {
                          const catId = typeof service.categoryId === 'object' ? service.categoryId?._id || service.categoryId?.id : service.categoryId;
                          const cat = categories.find(cat => cat.id === catId);
                          if (cat) return cat.name;
                          if (typeof service.categoryId === 'object' && service.categoryId?.name) return service.categoryId.name;
                          return catId || '-';
                        })()}
                      </td>
                      <td className="p-4">{service.baseDuration ? `${service.baseDuration} min` : '-'}</td>
                      <td className="p-4">
                        <Badge variant={service.status === 'active' ? "default" : "secondary"}>
                          {service.status || 'active'}
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
              <p className="text-sm text-muted-foreground">View submitted service suggestions</p>
              <div>
                <Button variant="outline" onClick={() => router.push('/admin/service-suggestions')}>View Suggestions</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}