import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { TaskListItem } from '../types';
import { Card } from '../components/ui/Card';
import { Code2, Users, Search, Filter } from 'lucide-react';

export const Home: React.FC = () => {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getTasks()
      .then(data => {
        setTasks(data.tasks);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container py-12 flex justify-center"><div className="animate-pulse text-[#06b6d4] font-bold tracking-widest">LOADING CHALLENGES...</div></div>;
  if (error) return <div className="container py-12 text-[#ef4444] text-center font-bold">Error: {error}</div>;

  return (
    <div className="container py-4 animate-slide-up">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">Coding Challenges</h1>
          <p className="text-[#94a3b8] text-lg font-medium">
            Solve real issues and earn XP.
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input 
              type="text" 
              placeholder="Search challenges..." 
              className="w-full bg-[#06080d]/80 border border-[rgba(255,255,255,0.08)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#06b6d4] focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#12182b] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#f8fafc] hover:bg-[#1c243c] transition-colors whitespace-nowrap">
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center text-[#94a3b8] py-12 glass-panel font-medium tracking-wide">No tasks available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => {
            const isAdvanced = task.difficulty === 'ADVANCED';
            const isIntermediate = task.difficulty === 'INTERMEDIATE';
            
            return (
            <Link to={`/tasks/${task.id}`} key={task.id} className="hover:no-underline block h-full group">
              <Card hoverEffect neonBorder className="h-full flex flex-col p-0">
                <div className="p-6 flex flex-col h-full relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                      isAdvanced ? 'bg-gradient-to-br from-[#ef4444] to-[#b91c1c] shadow-[#ef4444]/20' : 
                      isIntermediate ? 'bg-gradient-to-br from-[#a855f7] to-[#7e22ce] shadow-[#a855f7]/20' : 
                      'bg-gradient-to-br from-[#06b6d4] to-[#0369a1] shadow-[#06b6d4]/20'
                    }`}>
                      <Code2 size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1 leading-tight group-hover:text-[#06b6d4] transition-colors">{task.title}</h3>
                      <div className="text-xs font-semibold tracking-wider text-[#94a3b8] uppercase">
                        {task.challengeRepoUrl.split('/').slice(-2).join('/')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6 flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-[#f8fafc]">Level: {task.difficulty}</span>
                      <span className={`text-xs font-bold ${
                        isAdvanced ? 'text-[#ef4444]' : isIntermediate ? 'text-[#a855f7]' : 'text-[#06b6d4]'
                      }`}>
                        +250 XP
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#06080d] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
                      <div className={`h-full rounded-full ${
                        isAdvanced ? 'bg-gradient-to-r from-[#ef4444] to-[#fca5a5] w-[85%]' : 
                        isIntermediate ? 'bg-gradient-to-r from-[#a855f7] to-[#d8b4fe] w-[60%]' : 
                        'bg-gradient-to-r from-[#06b6d4] to-[#67e8f9] w-[30%]'
                      }`} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5 text-sm text-[#94a3b8] font-medium">
                      <Users size={14} />
                      <span>Total participants:</span>
                      <span className="text-white ml-1">{task.submissionCount}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <button className="w-full py-3 rounded-xl font-bold text-sm tracking-wide bg-[#12182b] text-white border border-[rgba(255,255,255,0.05)] group-hover:bg-gradient-to-r group-hover:from-[#06b6d4] group-hover:to-[#3b82f6] group-hover:border-transparent transition-all duration-300">
                      CONTINUE
                    </button>
                  </div>
                </div>
              </Card>
            </Link>
          )})}
        </div>
      )}
    </div>
  );
};
