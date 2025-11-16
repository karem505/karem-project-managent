/**
 * Header Component
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Bell, User, LogOut, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 elevation-2">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            Project Management
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl relative transition-all hover:scale-105">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive-500 rounded-full ring-2 ring-card"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 pl-3 pr-4 hover:bg-muted rounded-xl transition-all hover:elevation-1"
            >
              <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold elevation-1 ring-2 ring-primary-100">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-foreground">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-3 w-56 bg-card rounded-2xl elevation-3 border border-border py-2 z-20 animate-scale-in">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4 text-primary-600" />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4 text-primary-600" />
                    Settings
                  </button>
                  <div className="my-2 border-t border-border" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-destructive-600 hover:bg-destructive-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
