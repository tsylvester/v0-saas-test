import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { Loader2 } from "lucide-react"
import type { RootState } from "@/store"

export default function ProtectedRoute() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    // Redirect to login page but save the attempted URL
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />
  }

  // User is authenticated, render the protected route
  return <Outlet />
}
