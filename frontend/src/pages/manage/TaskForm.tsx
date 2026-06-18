import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { ManageTask } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { ArrowLeft } from 'lucide-react';

export const TaskForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    challengeRepoUrl: '',
    baseBranch: '',
    instructions: '',
    acceptanceCriteria: '',
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    tags: 'react, frontend',
  });

  useEffect(() => {
    if (isEditing && id) {
      api.getManageTask(id)
        .then(data => {
          setFormData({
            title: data.task.title,
            description: data.task.description,
            challengeRepoUrl: data.task.challengeRepoUrl,
            baseBranch: data.task.baseBranch || '',
            instructions: data.task.instructions,
            acceptanceCriteria: data.task.acceptanceCriteria || '',
            difficulty: data.task.difficulty,
            status: data.task.status,
            tags: data.task.tags.join(', '),
          });
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    const payload: Partial<ManageTask> = {
      ...formData,
      difficulty: formData.difficulty as any,
      status: formData.status as any,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      baseBranch: formData.baseBranch || null,
      acceptanceCriteria: formData.acceptanceCriteria || null,
    };

    try {
      if (isEditing && id) {
        await api.updateTask(id, payload);
        navigate(`/manage/tasks/${id}`);
      } else {
        const res = await api.createTask(payload);
        navigate(`/manage/tasks/${res.task.id}`);
      }
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-12 text-center text-[#94a3b8]">Loading task...</div>;

  return (
    <div className="container py-8 max-w-3xl animate-fade-in">
      <Link to="/manage" className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>
      
      <h1 className="text-3xl font-bold text-white mb-8">{isEditing ? 'Edit Task' : 'Create New Task'}</h1>
      
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Title" name="title" value={formData.title} onChange={handleChange} required placeholder="Build a feature..." />
            <Input label="Challenge Repo URL" name="challengeRepoUrl" value={formData.challengeRepoUrl} onChange={handleChange} required type="url" placeholder="https://github.com/..." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-[#f8fafc]">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="bg-[#0f172a]/50 border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full">
              <label className="text-sm font-medium text-[#f8fafc]">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="bg-[#0f172a]/50 border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <Textarea label="Description" name="description" value={formData.description} onChange={handleChange} required placeholder="High level overview of the task..." />
          <Textarea label="Instructions" name="instructions" value={formData.instructions} onChange={handleChange} required placeholder="Step by step instructions..." className="min-h-[150px]" />
          <Textarea label="Acceptance Criteria" name="acceptanceCriteria" value={formData.acceptanceCriteria} onChange={handleChange} placeholder="What needs to be done to consider this complete..." />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Base Branch (Optional)" name="baseBranch" value={formData.baseBranch} onChange={handleChange} placeholder="main" />
            <Input label="Tags (comma separated)" name="tags" value={formData.tags} onChange={handleChange} placeholder="react, typescript, ui" />
          </div>

          {error && <div className="text-[#ef4444] text-sm bg-[#ef4444]/10 p-3 rounded">{error}</div>}

          <div className="flex justify-end gap-4 mt-4">
            <Link to={isEditing ? `/manage/tasks/${id}` : "/manage"}>
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
