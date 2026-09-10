'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Github, 
  GitPullRequest, 
  ShieldAlert, 
  Settings, 
  Search, 
  Bell, 
  UserCircle,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { useSession, signOut } from 'next-auth/react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Repositories', href: '/dashboard/repositories', icon: Github },
    { name: 'Pull Requests', href: '/dashboard/pull-requests', icon: GitPullRequest },
    { name: 'Security', href: '/dashboard/security', icon: ShieldAlert },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-100 overflow-hidden">
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#111111] flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">CodeLens AI</span>
          </Link>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5 shrink-0", isActive ? "text-blue-400" : "text-gray-400")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
          <div className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User" className="w-6 h-6 rounded-full mr-3 shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center mr-3 border border-blue-500/50 shrink-0">
                <span className="text-xs text-blue-200">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
            <span className="truncate">{session?.user?.name || session?.user?.email || 'User'}</span>
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <span className="truncate">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-white/10 bg-[#0a0a0a] flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden text-gray-400 hover:text-white mr-4"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-md hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-md leading-5 bg-[#111111] text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search repositories, issues, PRs..."
              />
            </div>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4 text-gray-400 shrink-0">
            <button className="hover:text-white transition-colors"><Bell className="h-5 w-5" /></button>
            <button className="hover:text-white transition-colors"><UserCircle className="h-6 w-6" /></button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
