import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { PermissionState } from '@/components/ui/permission-state';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('app_admin' | 'general_admin' | 'musician' | 'external_viewer')[];
  showPermissionState?: boolean; // Show friendly UI instead of redirect
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  showPermissionState = true 
}: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    if (showPermissionState) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <PermissionState 
            type="restricted"
            title="Admin Access Required"
            description="This section is only available to administrators. Contact your band admin if you need access."
          />
        </div>
      );
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}