import React, { useState } from 'react';
import { Menu, Search, Bell, Shield, User, LogOut } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Header = ({
  user,
  onOpenMobileMenu,
  onOpenSearch,
  activeSectionTitle,
  logout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Toggle & Active Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
            {activeSectionTitle || 'Dashboard'}
          </h1>
          {user && (
            <Badge variant={user.role === 'ADMIN' ? 'purple' : user.role === 'DOCTOR' ? 'teal' : 'cyan'}>
              {user.role}
            </Badge>
          )}
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar Trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-all cursor-pointer w-48 lg:w-64"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Search records, doctors...</span>
          <kbd className="hidden lg:inline-block ml-auto text-[10px] font-mono bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-slate-500">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenSearch}
          className="sm:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* System Health / Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Clinical Network Online</span>
        </div>

        {/* Notifications Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase font-mono text-slate-200">Clinical Alerts</h4>
                <span className="text-[10px] text-cyan-400 font-mono">Live Sync</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <p className="font-semibold text-slate-200">System Notification Active</p>
                  <p className="text-slate-400 text-[11px]">Telehealth WebRTC server & HIPAA outbox are fully operational.</p>
                  <p className="text-[10px] font-mono text-slate-500">Just now</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xs font-mono">
                {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0).toUpperCase()}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-white truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (logout) logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
