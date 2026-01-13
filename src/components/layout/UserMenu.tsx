import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User, Shield, Music, Eye, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const roleConfig = {
  app_admin: { label: 'App Admin', icon: Shield, color: 'text-primary' },
  general_admin: { label: 'General Admin', icon: Shield, color: 'text-primary' },
  musician: { label: 'Musician', icon: Music, color: 'text-secondary' },
  external_viewer: { label: 'Viewer', icon: Eye, color: 'text-muted-foreground' },
};

export function UserMenu() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const initials = user.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user.email?.[0].toUpperCase() || '?';

  const roleInfo = role ? roleConfig[role] : null;
  const RoleIcon = roleInfo?.icon;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 glass-card border-border" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-foreground">
              {user.user_metadata?.full_name || 'Band Member'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            {roleInfo && RoleIcon && (
              <div className={`flex items-center gap-1.5 mt-1 ${roleInfo.color}`}>
                <RoleIcon className="h-3 w-3" />
                <span className="text-xs font-medium">{roleInfo.label}</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem className="cursor-pointer focus:bg-muted">
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        {(role === 'app_admin' || role === 'general_admin') && (
          <DropdownMenuItem asChild className="cursor-pointer focus:bg-muted">
            <Link to="/admin">
              <Settings className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
