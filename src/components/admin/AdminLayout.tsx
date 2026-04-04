import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  CalendarDays, Users, FileText, BarChart3, Stethoscope,
  LogOut, Menu, X, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", icon: BarChart3, label: "Dashboard", end: true },
  { to: "/admin/appointments", icon: CalendarDays, label: "Appointments" },
  { to: "/admin/patients", icon: Users, label: "Patients" },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors" },
  { to: "/admin/blog", icon: FileText, label: "Blog CMS" },
];

const AdminLayout = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
    if (!loading && user && !isAdmin) navigate("/admin/login");
  }, [loading, user, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <h2 className="font-heading text-lg font-semibold text-primary truncate">
          {sidebarOpen ? "Radiance Admin" : "RA"}
        </h2>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={() => { signOut(); navigate("/"); }}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && "Sign Out"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-full mt-1"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="w-4 h-4" />
          {sidebarOpen && <span className="text-xs ml-1">Back to Site</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/50 bg-card transition-all duration-300",
          sidebarOpen ? "w-60" : "w-16"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-card shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/50 bg-card flex items-center px-4 gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="hidden md:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
          <span className="text-sm text-muted-foreground truncate">
            {user.email}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
