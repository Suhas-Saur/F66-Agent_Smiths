import { useState } from 'react';
import { X, UserCheck, ArrowRight } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
}

export const PRESET_USERS: Record<UserRole, UserProfile> = {
  customer: {
    name: 'Alex Rivera',
    email: 'alex.rivera@workshop-apex.internal',
    role: 'customer',
    avatar: 'AR',
    title: 'Senior Workshop Field Technician',
    badge: 'Customer Desk',
  },
  admin: {
    name: 'Elena Vance',
    email: 'elena.vance@partsure.ai',
    role: 'admin',
    avatar: 'EV',
    title: 'Chief Procurement Officer & Safety Officer',
    badge: 'Admin Dispatcher',
  },
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('customer');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const initials = customName
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'US';

    onSelectUser({
      name: customName.trim(),
      email: `${customName.toLowerCase().replace(/\s+/g, '.')}@partsure.internal`,
      role: customRole,
      avatar: initials,
      title: customRole === 'admin' ? 'Procurement Desk Specialist' : 'Workshop Technician',
      badge: customRole === 'admin' ? 'Admin Dispatcher' : 'Customer Desk',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-lg bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white">Instant Authentication & Role Switcher</h3>
              <p className="text-[11px] text-slate-400">Select a pre-authenticated role or enter custom credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Instant Profiles */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Instant 1-Click Login Profiles
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Customer Instant Profile */}
            <div
              onClick={() => {
                onSelectUser(PRESET_USERS.customer);
                onClose();
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                currentUser.role === 'customer'
                  ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs flex items-center justify-center">
                  AR
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Customer
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                Alex Rivera
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Senior Workshop Tech</p>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
                <span>1-Click Login</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Admin Instant Profile */}
            <div
              onClick={() => {
                onSelectUser(PRESET_USERS.admin);
                onClose();
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
                currentUser.role === 'admin'
                  ? 'bg-blue-500/10 border-blue-500/60 ring-1 ring-blue-500/30'
                  : 'bg-slate-950/80 border-slate-800 hover:border-blue-500/40 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 font-bold font-mono text-xs flex items-center justify-center">
                  EV
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Admin
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition">
                Elena Vance
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Procurement Desk Lead</p>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-blue-400 font-medium">
                <span>1-Click Login</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Instant Sign-In */}
        <form onSubmit={handleCustomLogin} className="space-y-3 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Or Sign In with Custom Identity
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter Full Name (e.g. Maya Chen)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <select
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!customName.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition disabled:opacity-40"
          >
            Sign In with Custom Profile
          </button>
        </form>
      </div>
    </div>
  );
};
