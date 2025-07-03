import { Navigate } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/AuthGuard'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  return (
    <AuthGuard fallback={<Navigate to="/login" replace />}>
      {children}
    </AuthGuard>
  )
}