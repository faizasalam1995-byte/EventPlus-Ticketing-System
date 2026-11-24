import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ticket,
  QrCode,
  BarChart3,
  CalendarPlus,
  Shield,
  Sparkles,
  LogOut,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAi: () => void;
  ticketCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAi, ticketCount }) => {
  const { user, role, isStaff, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Ticket className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-sans">
                Event<span className="text-indigo-400">Pulse</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Ticketing & Check-In System</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Events</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tickets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-indigo-400" />
            <span>My Tickets</span>
            {ticketCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                {ticketCount}
              </span>
            )}
          </button>

          {/* Check-In Scanner (Staff / Organizer / Admin) */}
          {isStaff && (
            <button
              onClick={() => setActiveTab('checkin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'checkin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-slate-800'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Check-In Gate</span>
            </button>
          )}

          {/* Attendance Dashboard (Organizer / Admin) */}
          {isStaff && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Attendance Dashboard</span>
            </button>
          )}

          {/* Event CRUD (Organizer / Admin) */}
          {isStaff && (
            <button
              onClick={() => setActiveTab('events_manage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'events_manage'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>Publish Event</span>
            </button>
          )}

          {/* Admin System Audit */}
          {role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-purple-400 hover:text-purple-300 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Concierge Trigger */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 rounded-xl text-xs font-semibold text-indigo-300 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Pulse AI</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-slate-200">{user?.name || 'Guest'}</p>
              <p className="text-[10px] text-indigo-400 capitalize font-medium">{role} View</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-900 border-t border-slate-800 p-2 text-xs">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-2 py-1 rounded ${activeTab === 'explore' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Explore
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-2 py-1 rounded ${activeTab === 'tickets' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Passes
        </button>
        {isStaff && (
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-2 py-1 rounded ${activeTab === 'checkin' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            Check-In
          </button>
        )}
        {isStaff && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2 py-1 rounded ${activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
        )}
        {role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded ${activeTab === 'admin' ? 'text-purple-400 font-bold' : 'text-slate-400'}`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
