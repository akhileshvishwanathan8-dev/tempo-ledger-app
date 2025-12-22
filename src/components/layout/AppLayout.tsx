import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "./BottomNav";
import { UserMenu } from "./UserMenu";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  action?: ReactNode;
}

export function AppLayout({ children, title, showBackButton, action }: AppLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold gradient-text-purple">
              {title || 'Musifi'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {action}
            <UserMenu />
          </div>
        </div>
      </header>
      
      <main className="pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
