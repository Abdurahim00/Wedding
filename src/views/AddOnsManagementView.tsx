"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AddOn } from '@/src/models/AddOnModel'

export default function AddOnsManagementView() {
  const { toast } = useToast()
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddOn, setEditingAddOn] = useState<AddOn | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    priceType: 'fixed' as 'fixed' | 'per_person',
    unit: '',
    isActive: true
  })

  useEffect(() => {
    fetchAddOns()
  }, [])

  const fetchAddOns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/addons?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setAddOns(data)
      }
    } catch (error) {
      console.error('Failed to fetch add-ons:', error)
      toast({
        title: "Fel",
        description: "Kunde inte ladda tilläggstjänster",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Fel",
        description: "Namn och pris krävs",
        variant: "destructive"
      })
      return
    }

    try {
      const url = '/api/addons'
      const method = editingAddOn ? 'PUT' : 'POST'
      const body = editingAddOn 
        ? { 
            id: editingAddOn.id, 
            ...formData,
            unit: formData.priceType === 'per_person' ? formData.unit || 'per person' : formData.unit
          }
        : {
            ...formData,
            unit: formData.priceType === 'per_person' ? formData.unit || 'per person' : formData.unit
          }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast({
          title: "Lyckades",
          description: editingAddOn ? "Tilläggstjänsten uppdaterades" : "Tilläggstjänsten skapades"
        })
        setDialogOpen(false)
        resetForm()
        await fetchAddOns()
      } else {
        throw new Error('Failed to save add-on')
      }
    } catch (error) {
      console.error('Error saving add-on:', error)
      toast({
        title: "Fel",
        description: "Kunde inte spara tilläggstjänsten",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (addOn: AddOn) => {
    setEditingAddOn(addOn)
    setFormData({
      name: addOn.name,
      description: addOn.description || '',
      price: addOn.price.toString(),
      priceType: addOn.priceType || 'fixed',
      unit: addOn.unit || '',
      isActive: addOn.isActive
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna tilläggstjänst?')) return

    try {
      const response = await fetch(`/api/addons?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Lyckades",
          description: "Tilläggstjänsten togs bort"
        })
        await fetchAddOns()
      } else {
        throw new Error('Failed to delete add-on')
      }
    } catch (error) {
      console.error('Error deleting add-on:', error)
      toast({
        title: "Fel",
        description: "Kunde inte ta bort tilläggstjänsten",
        variant: "destructive"
      })
    }
  }

  const handleToggleActive = async (addOn: AddOn) => {
    try {
      const response = await fetch('/api/addons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: addOn.id,
          isActive: !addOn.isActive
        })
      })

      if (response.ok) {
        await fetchAddOns()
      }
    } catch (error) {
      console.error('Error toggling add-on status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      priceType: 'fixed',
      unit: '',
      isActive: true
    })
    setEditingAddOn(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tilläggstjänster
            </CardTitle>
            <CardDescription>Hantera extra tjänster som kan läggas till bokningar</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Lägg till ny
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingAddOn ? 'Redigera tilläggstjänst' : 'Skapa ny tilläggstjänst'}</DialogTitle>
                  <DialogDescription>
                    {editingAddOn ? 'Uppdatera tjänstens detaljer' : 'Lägg till en ny tjänst som kunder kan köpa'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Namn *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="t.ex., Fotograf, DJ, Catering"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Beskrivning</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Kort beskrivning av tjänsten"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceType">Pristyp *</Label>
                    <Select 
                      value={formData.priceType} 
                      onValueChange={(value: 'fixed' | 'per_person') => setFormData({ ...formData, priceType: value })}
                    >
                      <SelectTrigger id="priceType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fast pris</SelectItem>
                        <SelectItem value="per_person">Per person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Pris (SEK) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  {formData.priceType === 'per_person' && (
                    <div className="space-y-2">
                      <Label htmlFor="unit">Enhet</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="per person"
                      />
                      <p className="text-sm text-muted-foreground">
                        Hur priset visas (t.ex., "per person", "per gäst")
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Aktiv</Label>
                    <Switch
                      id="active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Avbryt
                  </Button>
                  <Button type="submit">
                    {editingAddOn ? 'Uppdatera' : 'Skapa'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Beskrivning</TableHead>
                <TableHead>Pris</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Åtgärder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : addOns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Inga tilläggstjänster skapade ännu
                  </TableCell>
                </TableRow>
              ) : (
                addOns.map((addOn) => (
                  <TableRow key={addOn.id}>
                    <TableCell className="font-medium">{addOn.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{addOn.description || '-'}</TableCell>
                    <TableCell>
                      {addOn.price.toLocaleString('sv-SE')} SEK
                      {addOn.priceType === 'per_person' && (
                        <span className="text-sm text-muted-foreground"> {addOn.unit || 'per person'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{addOn.priceType === 'per_person' ? 'Per person' : 'Fast pris'}</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={addOn.isActive}
                        onCheckedChange={() => handleToggleActive(addOn)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(addOn)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(addOn.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}