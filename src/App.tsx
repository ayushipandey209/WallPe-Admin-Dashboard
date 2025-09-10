import { useState } from 'react';
import { LayoutDashboard, List, Users, CheckCircle, Bell, BarChart3, Settings, Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { ListingsManagement } from './components/ListingsManagement';
import { UserManagement } from './components/UserManagement';
import { ApprovalsPage } from './components/ApprovalsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { SettingsPage } from './components/SettingsPage';

type NavigationItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
};

const navigationItems: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: DashboardOverview },
  { id: 'listings', label: 'Listings Management', icon: List, component: ListingsManagement },
  { id: 'users', label: 'User Management', icon: Users, component: UserManagement },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle, component: ApprovalsPage },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationsPage },
  { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, component: AnalyticsPage },
  { id: 'settings', label: 'Settings', icon: Settings, component: SettingsPage },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const ActiveComponent = navigationItems.find(item => item.id === activeTab)?.component || DashboardOverview;

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-semibold">W</span>
          </div>
          <h2 className="font-semibold">WallPe Admin</h2>
        </div>
      </div>
      
      <div className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Layout */}
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onSearch={(query) => console.log('Search:', query)}
            onQuickAction={(action) => console.log('Quick action:', action)}
          />
          
          <main className="flex-1 overflow-auto bg-muted/30 p-4 lg:p-6">
            <ActiveComponent />
          </main>
        </div>
      </div>
    </div>
  );
}