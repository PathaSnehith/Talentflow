import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  ArchiveBoxIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useJobStore } from '../store';
import { useCandidateStore } from '../store';
import { Job, Candidate } from '../types';
import JobModal from '../components/JobModal';
import toast from 'react-hot-toast';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, updateJob } = useJobStore();
  const { candidates } = useCandidateStore();
  const [job, setJob] = useState<Job | null>(null);
  const [jobCandidates, setJobCandidates] = useState<Candidate[]>([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundJob = jobs.find(j => j.id === id);
      if (foundJob) {
        setJob(foundJob);
        setJobCandidates(candidates.filter(c => c.jobId === id));
        setLoading(false);
      } else {
        // If job not found in store, try to fetch from API
        fetchJob();
      }
    }
  }, [id, jobs, candidates]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);
        setJobCandidates(candidates.filter(c => c.jobId === id));
      } else {
        toast.error('Job not found');
      }
    } catch (error) {
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const handleJobUpdate = async (jobData: Partial<Job>) => {
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });
      
      if (!response.ok) throw new Error('Failed to update job');
      
      const updatedJob = await response.json();
      setJob(updatedJob);
      updateJob(id!, updatedJob);
      setShowJobModal(false);
      toast.success('Job updated successfully');
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const handleJobArchive = async () => {
    if (!job) return;
    
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: job.status === 'active' ? 'archived' : 'active' 
        })
      });
      
      if (!response.ok) throw new Error('Failed to update job');
      
      const updatedJob = await response.json();
      setJob(updatedJob);
      updateJob(id!, updatedJob);
      toast.success(`Job ${job.status === 'active' ? 'archived' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCandidatesByStage = (stage: Candidate['stage']) => {
    return jobCandidates.filter(candidate => candidate.stage === stage);
  };

  const stageLabels = {
    applied: 'Applied',
    screen: 'Screening',
    tech: 'Technical',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected'
  };

  const stageColors = {
    applied: 'bg-blue-100 text-blue-800',
    screen: 'bg-yellow-100 text-yellow-800',
    tech: 'bg-purple-100 text-purple-800',
    offer: 'bg-green-100 text-green-800',
    hired: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Job Not Found</h2>
        <p className="text-stone-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
        <Link to="/jobs" className="btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/jobs"
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{job.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                job.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-stone-100 text-stone-800'
              }`}>
                {job.status}
              </span>
              <div className="flex items-center text-sm text-stone-500">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Created {formatDate(job.createdAt)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowJobModal(true)}
            className="btn-secondary flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Edit
          </button>
          <button
            onClick={handleJobArchive}
            className={`btn-secondary flex items-center ${
              job.status === 'active' 
                ? 'hover:text-orange-600 hover:bg-orange-50' 
                : 'hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <ArchiveBoxIcon className="h-5 w-5 mr-2" />
            {job.status === 'active' ? 'Archive' : 'Activate'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Job Description</h2>
            {job.description ? (
              <div className="prose prose-stone max-w-none">
                <p className="text-stone-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            ) : (
              <p className="text-stone-500 italic">No description provided</p>
            )}
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-stone-700">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-sage-100 text-sage-700"
                  >
                    <TagIcon className="h-4 w-4 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Candidate Pipeline */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-900">Candidate Pipeline</h3>
              <Link
                to={`/candidates?jobId=${job.id}`}
                className="text-sage-600 hover:text-sage-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            <div className="space-y-3">
              {Object.entries(stageLabels).map(([stage, label]) => {
                const candidatesInStage = getCandidatesByStage(stage as Candidate['stage']);
                return (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[stage as keyof typeof stageColors]}`}>
                        {label}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-stone-900">
                      {candidatesInStage.length}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-stone-700">Total Candidates</span>
                <span className="text-sm font-bold text-stone-900">{jobCandidates.length}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to={`/candidates?jobId=${job.id}`}
                className="flex items-center p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <UsersIcon className="h-5 w-5 text-sage-600 mr-3" />
                <div>
                  <p className="font-medium text-stone-900">View Candidates</p>
                  <p className="text-sm text-stone-500">Manage applications</p>
                </div>
              </Link>
              
              <Link
                to={`/assessments/${job.id}`}
                className="flex items-center p-3 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 text-sage-600 mr-3" />
                <div>
                  <p className="font-medium text-stone-900">Assessment</p>
                  <p className="text-sm text-stone-500">Create or edit assessment</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Job Info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Job Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-stone-600">Created</span>
                <p className="text-sm text-stone-900">{formatDate(job.createdAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-stone-600">Last Updated</span>
                <p className="text-sm text-stone-900">{formatDate(job.updatedAt)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-stone-600">Order</span>
                <p className="text-sm text-stone-900">{job.order}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Modal */}
      {showJobModal && (
        <JobModal
          job={job}
          onSave={handleJobUpdate}
          onClose={() => setShowJobModal(false)}
        />
      )}
    </div>
  );
};

export default JobDetailPage;
