import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BriefcaseIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { useJobStore } from '../store';
import { useCandidateStore } from '../store';
import { useAssessmentStore } from '../store';

const DashboardPage = () => {
  const { jobs } = useJobStore();
  const { candidates } = useCandidateStore();
  const { assessments } = useAssessmentStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    candidatesByStage: {},
    totalAssessments: 0,
    recentActivity: []
  });

  useEffect(() => {
    const activeJobs = jobs.filter(job => job.status === 'active');
    const candidatesByStage = candidates.reduce((acc, candidate) => {
      acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      totalCandidates: candidates.length,
      candidatesByStage,
      totalAssessments: assessments.length,
      recentActivity: [
        ...jobs.slice(-3).map(job => ({ type: 'job', item: job, timestamp: job.updatedAt })),
        ...candidates.slice(-3).map(candidate => ({ type: 'candidate', item: candidate, timestamp: candidate.updatedAt }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
    });
  }, [jobs, candidates, assessments]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-2 text-stone-600">Welcome to TalentFlow - your hiring management platform</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BriefcaseIcon className="h-8 w-8 text-sage-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Total Jobs</p>
              <p className="text-2xl font-semibold text-stone-900">{stats.totalJobs}</p>
              <p className="text-sm text-stone-500">{stats.activeJobs} active</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-sage-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Total Candidates</p>
              <p className="text-2xl font-semibold text-stone-900">{stats.totalCandidates}</p>
              <p className="text-sm text-stone-500">
                {stats.candidatesByStage.applied || 0} applied
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-sage-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Assessments</p>
              <p className="text-2xl font-semibold text-stone-900">{stats.totalAssessments}</p>
              <p className="text-sm text-stone-500">Active assessments</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowUpIcon className="h-8 w-8 text-sage-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-stone-600">Hiring Rate</p>
              <p className="text-2xl font-semibold text-stone-900">
                {stats.candidatesByStage.hired ? 
                  Math.round((stats.candidatesByStage.hired / stats.totalCandidates) * 100) : 0}%
              </p>
              <p className="text-sm text-stone-500">Success rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Candidate Pipeline</h3>
          <div className="space-y-3">
            {Object.entries(stats.candidatesByStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[stage]}`}>
                    {stageLabels[stage]}
                  </span>
                </div>
                <span className="text-sm font-medium text-stone-900">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              to="/candidates"
              className="text-sage-600 hover:text-sage-700 text-sm font-medium"
            >
              View all candidates →
            </Link>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'job' ? 'bg-sage-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-900 truncate">
                      {activity.type === 'job' 
                        ? `Job "${activity.item.title}" updated`
                        : `Candidate "${activity.item.name}" updated`
                      }
                    </p>
                    <p className="text-xs text-stone-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-stone-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/jobs"
            className="flex items-center p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <BriefcaseIcon className="h-6 w-6 text-sage-600 mr-3" />
            <div>
              <p className="font-medium text-stone-900">Manage Jobs</p>
              <p className="text-sm text-stone-500">Create and edit job postings</p>
            </div>
          </Link>

          <Link
            to="/candidates"
            className="flex items-center p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <UsersIcon className="h-6 w-6 text-sage-600 mr-3" />
            <div>
              <p className="font-medium text-stone-900">View Candidates</p>
              <p className="text-sm text-stone-500">Review candidate applications</p>
            </div>
          </Link>

          <Link
            to="/assessments"
            className="flex items-center p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-6 w-6 text-sage-600 mr-3" />
            <div>
              <p className="font-medium text-stone-900">Create Assessment</p>
              <p className="text-sm text-stone-500">Build custom assessments</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


