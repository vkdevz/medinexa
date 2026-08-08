import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import { getNavItemsForRole } from './navigationConfig';

export const Sidebar = ({
  user,
  activeSection,
  onSelectSection,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  logout
}) => {
  const navigate = useNavigate();

  // Escape key handler for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  if (!user) return null;

  const role = user.role || 'PATIENT';
  const navGroups = getNavItemsForRole(role);

  const handleNavClick = (itemId, itemPath) => {
    if (onSelectSection) {
      onSelectSection(itemId);
    }
    if (itemPath) {
      navigate(itemPath);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        aria-label={`${role} Main Navigation`}
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${!isMobileOpen && isCollapsed ? 'lg:w-18' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className={`h-16 border-b border-[var(--border-subtle)] flex items-center justify-between px-4 ${isCollapsed && !isMobileOpen ? 'lg:justify-center lg:px-0' : ''}`}>
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => navigate('/')}
            title="VeloCura Enterprise Healthcare"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <span className="text-base font-extrabold tracking-tight text-[var(--text-primary)] block truncate">VeloCura</span>
                <span className="text-[10px] text-[var(--color-primary)] font-mono uppercase tracking-wider block -mt-1 truncate">
                  {role} Console
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-lg hover:bg-[var(--bg-elevated)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)]"
            aria-label="Close menu drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Context Card */}
        {(!isCollapsed || isMobileOpen) ? (
          <div className="p-3 mx-3 mt-3 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-subtle)] border border-cyan-500/30 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs font-mono shrink-0">
              {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 flex justify-center" title={`${user.firstName || user.email} (${role})`}>
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary-subtle)] border border-cyan-500/30 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs font-mono">
              {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Organization / Facility Context Indicator */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="px-3 pt-2">
            <div className="px-2 py-1 rounded bg-[var(--bg-app)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-1.5 truncate">
              <Building2 className="w-3 h-3 text-[var(--color-primary)] shrink-0" />
              <span className="truncate">Facility: VeloCura Central</span>
            </div>
          </div>
        )}

        {/* Navigation Group Items */}
        <nav className="flex-1 px-2.5 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id, item.path)}
                    aria-current={isActive ? 'page' : undefined}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] ${
                      isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-semibold border-l-2 border-[var(--color-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Actions & Collapse Toggle */}
        <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2">
          {/* Desktop Sidebar Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[var(--color-primary)]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-[11px]">Collapse View</span>
              </>
            )}
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (logout) logout();
              navigate('/login');
            }}
            title={isCollapsed && !isMobileOpen ? 'Sign Out Session' : undefined}
            className={`w-full flex items-center gap-2 py-2 text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent transition-colors cursor-pointer ${
              isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'px-3'
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!isCollapsed || isMobileOpen) && <span>Sign Out Session</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
