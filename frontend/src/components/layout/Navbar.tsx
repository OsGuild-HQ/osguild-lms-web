import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Code, LayoutDashboard } from 'lucide-react';
import { useRole } from '../../context/RoleContext';

export const Navbar: React.FC = () => {
  const { role, toggleRole } = useRole();
  const location = useLocation();

  return (
    <nav className="glass-panel sticky top-4 z-50 rounded-2xl mx-4 lg:mx-auto max-w-7xl mt-4 mb-8">
      <div className="px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 text-white font-extrabold text-xl hover:no-underline tracking-tight group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#a855f7] flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all">
              <Code size={18} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-[#cbd5e1] bg-clip-text text-transparent">
              OSguild
            </span>
          </Link>

          <div className="hidden md:flex gap-2">
            <Link 
              to="/" 
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all ${
                location.pathname === '/' || location.pathname.startsWith('/tasks')
                  ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4] shadow-[inset_0_1px_0_rgba(6,182,212,0.2)]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
              }`}
            >
              Challenges
            </Link>
            {role === 'MAINTAINER' && (
              <Link 
                to="/manage" 
                className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  location.pathname.startsWith('/manage')
                    ? 'bg-[rgba(168,85,247,0.1)] text-[#a855f7] shadow-[inset_0_1px_0_rgba(168,85,247,0.2)]'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-[#06080d]/80 rounded-xl p-1 border border-[rgba(255,255,255,0.05)] shadow-inner">
            <button
              onClick={() => role !== 'DEVELOPER' && toggleRole()}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                role === 'DEVELOPER' 
                  ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white shadow-sm border border-[rgba(255,255,255,0.05)]' 
                  : 'text-[#475569] hover:text-white'
              }`}
            >
              Developer
            </button>
            <button
              onClick={() => role !== 'MAINTAINER' && toggleRole()}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all ${
                role === 'MAINTAINER' 
                  ? 'bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)]' 
                  : 'text-[#475569] hover:text-[#a855f7]'
              }`}
            >
              <Shield size={12} />
              Maintainer
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
