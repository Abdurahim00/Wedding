"use client"

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/src/contexts/AdminAuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CalendarIcon, 
  DollarSignIcon, 
  VideoIcon, 
  LogOutIcon,
  TrendingUpIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TagIcon,
  Settings
} from 'lucide-react'
import BookingsManagementView from './BookingsManagementView'
import FinancialAnalyticsView from './FinancialAnalyticsView'
import VideoManagementView from './VideoManagementView'
import DateManagementView from './DateManagementView'
import { useStore } from '@/src/services/clientStore'

export default function AdminDashboardView() {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  const store = useStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch bookings on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  // Get summary stats
  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length

  // Calculate total revenue
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, booking) => sum + booking.price, 0)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(username, password)
    if (!success) {
      setLoginError(true)
      setTimeout(() => setLoginError(false), 3000)
    }
    setUsername('')
    setPassword('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Administratörsinloggning</CardTitle>
            <CardDescription>Ange ditt administratörslösenord för att fortsätta</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Användarnamn</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ange användarnamn"
                  className={loginError ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lösenord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ange lösenord"
                  className={loginError ? 'border-red-500' : ''}
                />
                {loginError && (
                  <p className="text-sm text-red-500">Ogiltiga uppgifter</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Logga in
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Standard: admin / admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Administrationspanel</h1>
            <Button onClick={logout} variant="outline" size="sm">
              <LogOutIcon className="h-4 w-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt antal bokningar</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekräftade</CardTitle>
              <CheckCircleIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Väntande</CardTitle>
              <ClockIcon className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total intäkt</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('sv-SE')} SEK</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Bokningar
            </TabsTrigger>
            <TabsTrigger value="dates">
              <Settings className="h-4 w-4 mr-2" />
              Datum
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Analys
            </TabsTrigger>
            <TabsTrigger value="video">
              <VideoIcon className="h-4 w-4 mr-2" />
              Video
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsManagementView />
          </TabsContent>

          <TabsContent value="dates">
            <DateManagementView />
          </TabsContent>

          <TabsContent value="analytics">
            <FinancialAnalyticsView />
          </TabsContent>

          <TabsContent value="video">
            <VideoManagementView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}