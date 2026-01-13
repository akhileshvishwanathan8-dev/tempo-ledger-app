import { AppLayout } from '@/components/layout/AppLayout';
import { useUsers, useUpdateUserRole, useDeleteUser, AppRole } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Shield, Music, Eye, Users, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const roleConfig = {
  app_admin: { label: 'App Admin', icon: Shield, color: 'bg-primary/20 text-primary border-primary/30' },
  general_admin: { label: 'General Admin', icon: Shield, color: 'bg-primary/20 text-primary border-primary/30' },
  musician: { label: 'Musician', icon: Music, color: 'bg-secondary/20 text-secondary border-secondary/30' },
  external_viewer: { label: 'Viewer', icon: Eye, color: 'bg-muted text-muted-foreground border-border' },
};

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading, error } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const handleRoleChange = (userId: string, newRole: AppRole) => {
    updateRole.mutate({ userId, newRole });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout title="Admin" showBackButton>
      <div className="p-4 space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">
                {users?.length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {users?.filter((u) => u.role === 'app_admin' || u.role === 'general_admin').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Admins</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-secondary">
                {users?.filter((u) => u.role === 'musician').length || 0}
              </div>
              <div className="text-xs text-muted-foreground">Musicians</div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user roles and permissions for your band
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load users. Make sure you have admin permissions.
              </div>
            ) : users?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found.
              </div>
            ) : (
              <div className="space-y-3">
                {users?.map((user) => {
                  const roleInfo = user.role ? roleConfig[user.role] : null;
                  const RoleIcon = roleInfo?.icon;
                  const isCurrentUser = user.user_id === currentUser?.id;

                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                    >
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground truncate">
                            {user.full_name || 'Unknown User'}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>

                      {/* Role Selector */}
                      <Select
                        value={user.role || undefined}
                        onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole)}
                        disabled={isCurrentUser || updateRole.isPending}
                      >
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue placeholder="Select role">
                            {roleInfo && RoleIcon && (
                              <div className="flex items-center gap-1.5">
                                <RoleIcon className="h-3.5 w-3.5" />
                                <span className="text-sm">{roleInfo.label}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="app_admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              App Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="general_admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-primary" />
                              General Admin
                            </div>
                          </SelectItem>
                          <SelectItem value="musician">
                            <div className="flex items-center gap-2">
                              <Music className="h-4 w-4 text-secondary" />
                              Musician
                            </div>
                          </SelectItem>
                          <SelectItem value="external_viewer">
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              Viewer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Delete Button */}
                      {!isCurrentUser && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {user.full_name || 'this user'}? 
                                This will delete their profile and role. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.user_id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base">Role Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-foreground">App Admin</div>
                <div className="text-sm text-muted-foreground">
                  Full access including user management, role changes, Google Calendar sync, and all settings.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-medium text-foreground">General Admin</div>
                <div className="text-sm text-muted-foreground">
                  Can manage gigs, finances, and view admin dashboard. Cannot manage users or sync calendar.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/5 border border-secondary/20">
              <Music className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <div className="font-medium text-foreground">Musician</div>
                <div className="text-sm text-muted-foreground">
                  Can view and manage gigs, songs, setlists, and update their availability.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
              <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium text-foreground">Viewer</div>
                <div className="text-sm text-muted-foreground">
                  Read-only access to view gigs and basic information.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
