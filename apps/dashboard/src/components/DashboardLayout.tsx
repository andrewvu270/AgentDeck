import { Link, useLocation } from 'react-router-dom';
import { Bot, Activity, Settings, LogOut, Users, Code } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { logout } = useAuthStore();
  
  const navItems = [
    { path: '/app/agents', icon: Bot, label: 'Agents' },
    { path: '/app/workspace', icon: Users, label: 'Workspace' },
    { path: '/app/executions', icon: Activity, label: 'Executions' },
    { path: '/app/integration', icon: Code, label: 'Integration' },
    { path: '/app/settings', icon: Settings, label: 'Settings' },
  ];
  
  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-secondary border-r border-border flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AgentDeck
          </h1>
          <p className="text-text-secondary text-sm mt-1">Manage AI Agents</p>
        </div>
        
        <nav className="flex-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
