import { AdminAuthProvider } from "@/src/contexts/AdminAuthContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  )
}