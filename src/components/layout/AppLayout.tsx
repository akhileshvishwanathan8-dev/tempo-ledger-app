import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { UserMenu } from "./UserMenu";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold gradient-text-purple">
            {title || 'Musifi'}
          </h1>
          <UserMenu />
        </div>
      </header>
      
      <main className="pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
