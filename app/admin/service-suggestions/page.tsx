"use client"

import { useAuth } from "../../_providers/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card"
import { Button } from "../../_components/ui/button"
import { Badge } from "../../_components/ui/badge"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { loungeService } from "../../_services"

export default function AdminServiceSuggestionsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && (!user || user.type !== 'admin')) {
      console.log('User not admin or not loaded:', user, isLoading)
      router.push('/')
    }
  }, [user, isLoading, router])

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const { suggestions } = await loungeService.getServiceSuggestions()
      console.log('Suggesaaaaaations loaded:', suggestions)
      setSuggestions(suggestions)
    } catch (err) {
      console.error('Failed to load suggestions', err)
      toast.error('Failed to load suggestions')
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) return null
  if (!user || user.type !== 'admin') return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl p-5 lg:px-8 lg:py-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push('/admin')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Service Suggestions</h1>
          <p className="text-muted-foreground">User-submitted service suggestions</p>
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
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Estimated Price</th>
                    <th className="text-left p-4 font-medium">Estimated Duration</th>
                    <th className="text-left p-4 font-medium">Target Gender</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Lounge</th>
                    <th className="text-left p-4 font-medium">Admin Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {suggestions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-4 text-muted-foreground text-center">No suggestions found.</td>
                    </tr>
                  )}
                  {suggestions.map(s => (
                    <tr key={s._id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{s.name}</td>
                      <td className="p-4">{s.description || '-'}</td>
                      <td className="p-4">{s.category || '-'}</td>
                      <td className="p-4">{s.estimatedPrice ? `${s.estimatedPrice} dinar` : '-'}</td>
                      <td className="p-4">{s.estimatedDuration ? `${s.estimatedDuration} min` : '-'}</td>
                      <td className="p-4">{s.targetGender || '-'}</td>
                      <td className="p-4">
                        <Badge>{s.status || 'PENDING'}</Badge>
                      </td>
                      <td className="p-4">{s.loungeId?.email || s.loungeId?._id || '-'}</td>
                      <td className="p-4">{s.adminNotes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
