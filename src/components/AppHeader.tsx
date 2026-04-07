import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "Utilisateur";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 backdrop-blur-md px-4 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-danger-foreground">
            3
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border-2 border-primary/30">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-foreground truncate max-w-[160px]">{displayName}</span>
            <span className="text-xs text-muted-foreground">Connecté</span>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </header>
  );
}
