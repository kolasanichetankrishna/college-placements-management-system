import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, Users, BookOpen, Brain, Headphones, Settings, 
  LogOut, Briefcase, ClipboardList, HelpCircle, CheckSquare, 
  FileText, ChevronLeft, ChevronRight, Menu, Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const menuItems: Record<UserRole, { path: string; label: string; icon: React.ElementType }[]> = {
  student: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/placement-drives', label: 'Placement Drives', icon: Briefcase },
    { path: '/skill-gap', label: 'Skill Gap', icon: Brain },
    { path: '/mentorship', label: 'Mentorship', icon: Headphones },
    { path: '/resume-upload', label: 'Resume Upload', icon: Upload },
    { path: '/preferences', label: 'Preferences', icon: Settings },
  ],
  hod: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/manage-students', label: 'Manage Students', icon: Users },
    { path: '/student-resumes', label: 'Student Resumes', icon: FileText },
    { path: '/preferences', label: 'Preferences', icon: Settings },
  ],
  placement: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/placement-drives', label: 'Placement Drives', icon: Briefcase },
    { path: '/view-students', label: 'View Students', icon: BookOpen },
    { path: '/student-resumes', label: 'Student Resumes', icon: FileText },
    { path: '/queries', label: 'Queries', icon: HelpCircle },
    { path: '/student-eligibility', label: 'Student Eligibility', icon: CheckSquare },
  ],
  principal: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student-eligibility', label: 'Check Student Eligibility', icon: CheckSquare },
    { path: '/queries', label: 'Queries', icon: HelpCircle },
    { path: '/student-details', label: 'Student Details', icon: FileText },
  ],
};

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('You have been successfully logged out');
    navigate('/login');
  };

  // Get current path
  const currentPath = location.pathname;

  // Get menu items based on user role
  const items = user ? menuItems[user.role] : [];

  if (!user) {
    return null; // Don't render anything if not logged in
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div>
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-primary-foreground hover:bg-primary/90"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <div className="font-bold">Placement Management</div>
        <div className="w-8"></div> {/* Spacer for balance */}
      </div>

      {/* Mobile sidebar (conditional render) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-3/4 max-w-xs bg-card shadow-xl p-4 animate-slide-in-right">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-xl">Menu</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="mb-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold mb-2">
                  {user.name.charAt(0)}
                </div>
                <div className="text-center">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>

              <Separator className="mb-4" />
              
              <nav className="space-y-1 flex-1">
                {items.map((item) => (
                  <Button
                    key={item.path}
                    variant={currentPath === item.path ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      currentPath === item.path 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </nav>
              
              <Button 
                variant="outline" 
                className="mt-auto"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div 
        className={cn(
          "hidden md:flex flex-col bg-card border-r transition-all duration-300 ease-in-out overflow-hidden",
          isSidebarCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h2 className="font-bold text-lg">Placement Management</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={cn(isSidebarCollapsed && "mx-auto")}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {!isSidebarCollapsed && (
          <div className="px-4 mb-6 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
            </div>
          </div>
        )}

        <Separator className="mb-4" />

        <nav className="flex-1 px-2 space-y-1">
          {items.map((item) => (
            <Button
              key={item.path}
              variant={currentPath === item.path ? "default" : "ghost"}
              className={cn(
                "w-full transition-all",
                isSidebarCollapsed ? "justify-center p-2" : "justify-start",
                currentPath === item.path 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              )}
              onClick={() => navigate(item.path)}
            >
              <item.icon className={cn("h-5 w-5", !isSidebarCollapsed && "mr-2")} />
              {!isSidebarCollapsed && item.label}
            </Button>
          ))}
        </nav>

        <div className="p-2 mt-auto">
          <Button 
            variant="outline" 
            className={cn(
              "w-full transition-all",
              isSidebarCollapsed ? "justify-center p-2" : "justify-start"
            )}
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", !isSidebarCollapsed && "mr-2")} />
            {!isSidebarCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <main className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in overflow-auto max-h-[calc(100vh-64px)] md:max-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
