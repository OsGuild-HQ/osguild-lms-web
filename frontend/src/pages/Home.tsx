import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { TaskListItem } from '../types';
import { Card } from '../components/ui/Card';
import { Code2, GitBranch } from 'lucide-react';

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

  if (loading) return <div className="container py-12 flex justify-center"><div className="animate-pulse text-[#94a3b8]">Loading tasks...</div></div>;
  if (error) return <div className="container py-12 text-[#ef4444] text-center">Error: {error}</div>;

  return (
    <div className="container py-12 animate-fade-in">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Open Source Challenges</h1>
        <p className="text-[#94a3b8] text-lg">
          Contribute to open source projects, solve real issues, and get your code merged.
          Pick a task below to get started.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center text-[#94a3b8] py-12 glass-panel">No tasks available right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <Link to={`/tasks/${task.id}`} key={task.id} className="hover:no-underline">
              <Card hoverEffect className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white mb-0">{task.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    task.difficulty === 'BEGINNER' ? 'bg-[#10b981]/20 text-[#10b981]' : 
                    task.difficulty === 'INTERMEDIATE' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                    'bg-[#ef4444]/20 text-[#ef4444]'
                  }`}>
                    {task.difficulty}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                    <Code2 size={16} />
                    <span className="truncate">{task.challengeRepoUrl}</span>
                  </div>
                  {task.baseBranch && (
                    <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                      <GitBranch size={16} />
                      <span>{task.baseBranch}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <div className="flex gap-2">
                    {task.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-xs bg-[#1e293b] text-[#94a3b8] px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && <span className="text-xs text-[#64748b]">+{task.tags.length - 2}</span>}
                  </div>
                  <div className="text-sm text-[#64748b]">
                    {task.submissionCount} submissions
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
