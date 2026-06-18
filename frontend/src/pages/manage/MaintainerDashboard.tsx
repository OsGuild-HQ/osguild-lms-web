import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { TaskListItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';

export const MaintainerDashboard: React.FC = () => {
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

  if (loading) return <div className="container py-12 text-center text-[#94a3b8]">Loading dashboard...</div>;
  if (error) return <div className="container py-12 text-center text-[#ef4444]">{error}</div>;

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Maintainer Dashboard</h1>
          <p className="text-[#94a3b8]">Manage your tasks and review submissions.</p>
        </div>
        <Link to="/manage/tasks/new">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Create Task
          </Button>
        </Link>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-6">Your Tasks</h2>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-[#94a3b8]">No tasks created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.1)]">
                  <th className="pb-3 text-sm font-semibold text-[#f8fafc]">Title</th>
                  <th className="pb-3 text-sm font-semibold text-[#f8fafc]">Status</th>
                  <th className="pb-3 text-sm font-semibold text-[#f8fafc]">Submissions</th>
                  <th className="pb-3 text-sm font-semibold text-[#f8fafc]">Created</th>
                  <th className="pb-3 text-sm font-semibold text-[#f8fafc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[#12182b]/50 transition-colors">
                    <td className="py-4">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="text-xs text-[#94a3b8] truncate max-w-xs">{task.challengeRepoUrl}</div>
                    </td>
                    <td className="py-4">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${
                        task.status === 'open' ? 'bg-[#10b981]/20 text-[#10b981]' :
                        'bg-[#64748b]/20 text-[#94a3b8]'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{task.submissionCount}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-[#94a3b8]">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <Link to={`/manage/tasks/${task.id}`}>
                        <Button variant="secondary" size="sm">Manage</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
