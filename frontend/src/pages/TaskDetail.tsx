import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Task, Submission } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { ArrowLeft, ExternalLink, CheckCircle } from 'lucide-react';

export const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [prUrl, setPrUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getTask(id)
      .then(data => {
        setTask(data.task);
        setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setSubmitting(true);
      const res = await api.createSubmission(id, { submitterName, prUrl, notes });
      setSubmissions(prev => [...prev, res.submission]);
      setSubmitSuccess(true);
      setPrUrl('');
      setNotes('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-12 text-center text-[#94a3b8]">Loading task details...</div>;
  if (error && !task) return <div className="container py-12 text-center text-[#ef4444]">{error}</div>;
  if (!task) return null;

  return (
    <div className="container py-8 max-w-4xl animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} /> Back to tasks
      </Link>
      
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
          <div className="flex gap-3 text-sm text-[#94a3b8]">
            <span className="bg-[#1e293b] px-2 py-1 rounded text-[#f8fafc]">{task.difficulty}</span>
            <span className="bg-[#1e293b] px-2 py-1 rounded">Status: {task.status}</span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.open(task.challengeRepoUrl, '_blank')} className="flex items-center gap-2">
          View Repository <ExternalLink size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <div className="text-[#cbd5e1] whitespace-pre-wrap">{task.description}</div>
          </Card>
          
          <Card>
            <h2 className="text-xl font-bold mb-4">Instructions</h2>
            <div className="text-[#cbd5e1] whitespace-pre-wrap">{task.instructions}</div>
          </Card>

          {task.acceptanceCriteria && (
            <Card>
              <h2 className="text-xl font-bold mb-4">Acceptance Criteria</h2>
              <div className="text-[#cbd5e1] whitespace-pre-wrap">{task.acceptanceCriteria}</div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card className="bg-[#0f172a] border-[#6366f1]/30">
            <h2 className="text-xl font-bold mb-4 text-[#f8fafc]">Submit Solution</h2>
            {submitSuccess ? (
              <div className="text-center py-4 text-[#10b981] flex flex-col items-center gap-2">
                <CheckCircle size={32} />
                <p>Submission received!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input 
                  label="Your Name/Handle" 
                  required 
                  value={submitterName}
                  onChange={e => setSubmitterName(e.target.value)}
                  placeholder="johndoe"
                />
                <Input 
                  label="Pull Request URL" 
                  type="url" 
                  required 
                  value={prUrl}
                  onChange={e => setPrUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
                <Textarea 
                  label="Notes (Optional)" 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional context..."
                />
                {error && <div className="text-[#ef4444] text-sm">{error}</div>}
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit PR'}
                </Button>
              </form>
            )}
          </Card>
          
          {submissions.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold mb-4">Recent Submissions</h2>
              <div className="flex flex-col gap-3">
                {submissions.map(sub => (
                  <div key={sub.id} className="p-3 bg-[#1e293b]/50 rounded-lg border border-[rgba(255,255,255,0.05)]">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">{sub.submitterName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        sub.status === 'APPROVED' ? 'bg-[#10b981]/20 text-[#10b981]' :
                        sub.status === 'REJECTED' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                        sub.status === 'CHANGES_REQUESTED' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' :
                        'bg-[#6366f1]/20 text-[#6366f1]'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#94a3b8] truncate">
                      {sub.prUrl}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
