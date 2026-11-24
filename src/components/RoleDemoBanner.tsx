import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { UserRole } from '../types';
import { Shield, Ticket, QrCode, Wifi, Database, CheckCircle2 } from 'lucide-react';

export const RoleDemoBanner: React.FC = () => {
  const { role, user, quickLogin } = useAuth();
  const { isConnected } = useSocket();
  const [dbStatus, setDbStatus] = useState<string>('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        setDbStatus(data.database || 'Connected');
      })
      .catch(() => setDbStatus('Resilient Store'));
  }, []);

  const roles: Array<{ key: UserRole; label: string; icon: any; color: string; email: string }> = [
    {
      key: 'attendee',
      label: 'Attendee',
      icon: Ticket,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      email: 'attendee@eventpulse.com',
    },
    {
      key: 'organizer',
      label: 'Organizer / Staff',
      icon: QrCode,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      email: 'organizer@eventpulse.com',
    },
    {
      key: 'admin',
      label: 'Admin Director',
      icon: Shield,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      email: 'admin@eventpulse.com',
    },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          Test Roles:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = role === r.key;
            return (
              <button
                key={r.key}
                onClick={() => quickLogin(r.key)}
                title={`Switch to ${r.label} (${r.email})`}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all ${
                  isActive
                    ? `${r.color} shadow-sm ring-1 ring-indigo-400/50 scale-105 font-bold`
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{r.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 text-slate-400">
        <div className="flex items-center gap-1.5" title="WebSocket Live Status">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="hidden sm:inline">Live Sync:</span>
          <span className={isConnected ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
            {isConnected ? 'Online' : 'Connecting'}
          </span>
        </div>
        <div className="flex items-center gap-1.5" title="Database Connection Status">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Database:</span>
          <span className="text-slate-300 font-medium truncate max-w-[140px] sm:max-w-none">
            {dbStatus}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-slate-500">
          <span>Active:</span>
          <span className="text-slate-200 font-semibold">{user?.name}</span>
        </div>
      </div>
    </div>
  );
};
