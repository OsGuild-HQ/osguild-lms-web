import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Task, Submission } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { ArrowLeft, ExternalLink, CheckCircle, Code2, Users } from 'lucide-react';

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

  if (loading) return <div className="container py-12 flex justify-center"><div className="animate-pulse text-[#06b6d4] font-bold tracking-widest">LOADING TASK...</div></div>;
  if (error && !task) return <div className="container py-12 text-center text-[#ef4444] font-bold">{error}</div>;
  if (!task) return null;

  const isAdvanced = task.difficulty === 'hard';
  const isIntermediate = task.difficulty === 'medium';

  return (
    <div className="container py-4 max-w-5xl animate-slide-up">
      <Link to="/" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#06b6d4] mb-6 text-sm font-semibold tracking-wide transition-colors">
        <ArrowLeft size={16} /> BACK TO CHALLENGES
      </Link>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg hidden sm:flex ${
            isAdvanced ? 'bg-gradient-to-br from-[#ef4444] to-[#b91c1c] shadow-[#ef4444]/20' : 
            isIntermediate ? 'bg-gradient-to-br from-[#a855f7] to-[#7e22ce] shadow-[#a855f7]/20' : 
            'bg-gradient-to-br from-[#06b6d4] to-[#0369a1] shadow-[#06b6d4]/20'
          }`}>
            <Code2 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">{task.title}</h1>
            <div className="flex flex-wrap gap-3 text-sm font-semibold tracking-wide">
              <span className={`px-3 py-1 rounded-lg ${
                isAdvanced ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20' :
                isIntermediate ? 'bg-[#a855f7]/10 text-[#a855f7] border border-[#a855f7]/20' :
                'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20'
              }`}><span className="capitalize">{task.difficulty}</span></span>
              <span className="bg-[#12182b] text-[#94a3b8] px-3 py-1 rounded-lg border border-[rgba(255,255,255,0.05)]">Status: <span className="capitalize">{task.status}</span></span>
            </div>
          </div>
        </div>
        <Button variant="secondary" onClick={() => window.open(task.challengeRepoUrl, '_blank')} className="w-full md:w-auto">
          View Repository <ExternalLink size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <h2 className="text-xl font-bold mb-4 tracking-tight">Description</h2>
            <div className="text-[#cbd5e1] whitespace-pre-wrap">{task.description}</div>
          </Card>
          
          <Card>
            <h2 className="text-xl font-bold mb-4 tracking-tight">Instructions</h2>
            <div className="text-[#cbd5e1] whitespace-pre-wrap leading-relaxed">{task.instructions}</div>
          </Card>

          {task.acceptanceCriteria && (
            <Card>
              <h2 className="text-xl font-bold mb-4 tracking-tight">Acceptance Criteria</h2>
              <div className="text-[#cbd5e1] whitespace-pre-wrap">{task.acceptanceCriteria}</div>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card neonBorder>
            <h2 className="text-xl font-bold mb-6 text-[#f8fafc] tracking-tight">Submit Solution</h2>
            {submitSuccess ? (
              <div className="text-center py-8 text-[#10b981] flex flex-col items-center gap-3">
                <CheckCircle size={48} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                <p className="font-bold text-lg tracking-wide">Submission received!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                {error && <div className="text-[#ef4444] text-sm font-semibold">{error}</div>}
                <Button type="submit" disabled={submitting} className="w-full mt-2">
                  {submitting ? 'SUBMITTING...' : 'SUBMIT PR'}
                </Button>
              </form>
            )}
          </Card>
          
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold tracking-tight">Participants</h2>
              <div className="flex items-center gap-1.5 text-sm text-[#06b6d4] font-bold bg-[#06b6d4]/10 px-3 py-1 rounded-full">
                <Users size={14} /> {submissions.length}
              </div>
            </div>
            
            {submissions.length === 0 ? (
              <p className="text-[#64748b] text-sm font-medium text-center py-4">No submissions yet. Be the first!</p>
            ) : (
              <div className="flex flex-col gap-3">
                {submissions.map(sub => (
                  <div key={sub.id} className="p-4 bg-[#06080d]/50 rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(6,182,212,0.2)] transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm tracking-wide">{sub.submitterName}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md capitalize ${
                        sub.status === 'approved' ? 'bg-[#10b981]/10 text-[#10b981]' :
                        sub.status === 'rejected' ? 'bg-[#ef4444]/10 text-[#ef4444]' :
                        sub.status === 'changes_requested' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                        'bg-[#06b6d4]/10 text-[#06b6d4]'
                      }`}>
                        {sub.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748b] font-medium truncate">
                      <a href={sub.prUrl} target="_blank" rel="noreferrer" className="hover:text-[#06b6d4] transition-colors">{sub.prUrl}</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
