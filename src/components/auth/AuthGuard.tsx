import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { user, loading, isConfigured } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se o Supabase não está configurado, permite acesso
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Se não há usuário logado, mostra fallback ou redireciona
  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};