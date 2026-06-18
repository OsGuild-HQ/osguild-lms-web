import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { ManageTask, ManageSubmission } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Edit, ExternalLink } from 'lucide-react';

export const ManageTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<ManageTask | null>(null);
  const [submissions, setSubmissions] = useState<ManageSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadTask();
  }, [id]);

  const loadTask = () => {
    if (!id) return;
    api.getManageTask(id)
      .then(data => {
        setTask(data.task);
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleReview = async (submissionId: string, status: string) => {
    if (!id) return;
    try {
      await api.reviewSubmission(id, submissionId, { status });
      // refresh task to get updated submissions
      loadTask();
    } catch (err: any) {
      alert(`Failed to review: ${err.message}`);
    }
  };

  if (loading) return <div className="container py-12 text-center text-[#94a3b8]">Loading...</div>;
  if (error && !task) return <div className="container py-12 text-center text-[#ef4444]">{error}</div>;
  if (!task) return null;

  return (
    <div className="container py-8 max-w-5xl animate-fade-in">
      <Link to="/manage" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
          <div className="flex gap-3 text-sm text-[#94a3b8]">
            <span className="bg-[#12182b] px-2 py-1 rounded text-[#f8fafc]">Manage View</span>
            <span className="bg-[#12182b] px-2 py-1 rounded">Status: {task.status}</span>
          </div>
        </div>
        <Link to={`/manage/tasks/${task.id}/edit`}>
          <Button variant="secondary" className="flex items-center gap-2">
            <Edit size={16} /> Edit Task
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Submissions ({submissions.length})</h2>
            </div>
            
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-[#94a3b8]">No submissions yet.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {submissions.map(sub => (
                  <div key={sub.id} className="p-4 bg-[#06080d]/50 rounded-lg border border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-semibold text-white">{sub.submitterName}</div>
                        <div className="text-sm text-[#94a3b8]">{new Date(sub.createdAt).toLocaleString()}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        sub.status === 'APPROVED' ? 'bg-[#10b981]/20 text-[#10b981]' :
                        sub.status === 'REJECTED' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                        sub.status === 'CHANGES_REQUESTED' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        'bg-[#06b6d4]/20 text-[#06b6d4]'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    
                    <a href={sub.prUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-[#06b6d4] hover:underline mb-4">
                      {sub.prUrl} <ExternalLink size={14} />
                    </a>
                    
                    {sub.notes && (
                      <div className="text-sm text-[#cbd5e1] bg-[#0f172a]/50 p-3 rounded mb-4">
                        <span className="text-xs text-[#64748b] block mb-1">Notes:</span>
                        {sub.notes}
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                      <Button size="sm" variant="secondary" onClick={() => handleReview(sub.id, 'APPROVED')} className="text-[#10b981] hover:bg-[#10b981]/20 hover:text-[#10b981] hover:border-[#10b981]/50">
                        Approve
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleReview(sub.id, 'CHANGES_REQUESTED')} className="text-[#f59e0b] hover:bg-[#f59e0b]/20 hover:text-[#f59e0b] hover:border-[#f59e0b]/50">
                        Request Changes
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleReview(sub.id, 'REJECTED')} className="text-[#ef4444] hover:bg-[#ef4444]/20 hover:text-[#ef4444] hover:border-[#ef4444]/50">
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="text-lg font-bold mb-4">Task Details</h2>
            <div className="flex flex-col gap-4 text-sm">
              <div>
                <span className="text-[#64748b] block mb-1">Repo URL</span>
                <a href={task.challengeRepoUrl} target="_blank" rel="noreferrer" className="text-[#06b6d4] hover:underline flex items-center gap-1 break-all">
                  {task.challengeRepoUrl} <ExternalLink size={12} />
                </a>
              </div>
              <div>
                <span className="text-[#64748b] block mb-1">Difficulty</span>
                <span className="text-[#f8fafc]">{task.difficulty}</span>
              </div>
              <div>
                <span className="text-[#64748b] block mb-1">Tags</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.tags.map(tag => (
                    <span key={tag} className="text-xs bg-[#12182b] px-2 py-0.5 rounded text-[#94a3b8]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
