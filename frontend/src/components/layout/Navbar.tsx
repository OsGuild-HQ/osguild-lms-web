import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Code, LayoutDashboard } from 'lucide-react';
import { useRole } from '../../context/RoleContext';


export const Navbar: React.FC = () => {
  const { role, toggleRole } = useRole();

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-none border-t-0 border-l-0 border-r-0">
      <div className="container mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl hover:no-underline">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#10b981] flex items-center justify-center">
              <Code size={18} className="text-white" />
            </div>
            OSGuild
          </Link>

          <div className="hidden md:flex gap-4">
            <Link to="/" className="text-sm font-medium text-[#94a3b8] hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors">
              Tasks
            </Link>
            {role === 'MAINTAINER' && (
              <Link to="/manage" className="text-sm font-medium text-[#94a3b8] hover:text-white hover:no-underline px-3 py-2 rounded-md transition-colors flex items-center gap-2">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0f172a] rounded-full p-1 border border-[rgba(255,255,255,0.05)]">
            <button
              onClick={() => role !== 'DEVELOPER' && toggleRole()}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                role === 'DEVELOPER' 
                  ? 'bg-[#1e293b] text-white shadow-sm' 
                  : 'text-[#64748b] hover:text-white'
              }`}
            >
              Developer
            </button>
            <button
              onClick={() => role !== 'MAINTAINER' && toggleRole()}
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                role === 'MAINTAINER' 
                  ? 'bg-[#1e293b] text-[#10b981] shadow-sm' 
                  : 'text-[#64748b] hover:text-[#10b981]'
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
