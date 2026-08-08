import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Calendar,
  UserCheck,
  FileText,
  ShieldAlert,
  Users,
  Stethoscope,
  Clock,
  Sparkles,
  Award,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ user, activeSection, onSelectSection, isMobileOpen, onCloseMobile, logout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const role = user.role;

  const patientNav = [
    { id: 'overview', label: 'Dashboard Home', icon: Activity },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'doctors', label: 'Doctor Directory', icon: Stethoscope },
    { id: 'triage', label: 'AI Symptom Assessment', icon: Sparkles },
    { id: 'passport', label: 'Medical Passport', icon: UserCheck },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'reports', label: 'Medical Reports', icon: Clock }
  ];

  const doctorNav = [
    { id: 'schedule', label: 'Today\'s Schedule', icon: Calendar },
    { id: 'consultations', label: 'Patient Consultations', icon: Stethoscope },
    { id: 'passport', label: 'Patient Passport Viewer', icon: UserCheck },
    { id: 'profile', label: 'Doctor Profile & Status', icon: Award }
  ];

  const adminNav = [
    { id: 'dashboard', label: 'Console Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'doctors', label: 'Doctor Verifications', icon: Stethoscope },
    { id: 'security', label: 'Security OTP Audit', icon: ShieldAlert }
  ];

  const navItems = role === 'PATIENT' ? patientNav : role === 'DOCTOR' ? doctorNav : adminNav;

  const handleNavClick = (itemId) => {
    if (onSelectSection) {
      onSelectSection(itemId);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">VeloCura</span>
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block -mt-1">
                {role} Enterprise
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Identity Tag */}
        <div className="p-4 mx-4 mt-4 bg-slate-950/60 rounded-lg border border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
            {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">
              {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
            </p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Workspace Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <button
            onClick={() => {
              if (logout) logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/20 rounded-lg border border-transparent transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
