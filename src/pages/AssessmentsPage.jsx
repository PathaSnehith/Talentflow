import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  BriefcaseIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAssessmentStore } from '../store';
import { db } from '../db';
import toast from 'react-hot-toast';

const AssessmentsPage = () => {
  const { assessments, setAssessments, loading, setLoading } = useAssessmentStore();
  const [jobs, setJobs] = useState([]);

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const allAssessments = await db.assessments.toArray();
      setAssessments(allAssessments);
      const allJobs = await db.jobs.toArray();
      setJobs(allJobs);
    } catch (error) {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (assessment) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await db.assessments.delete(assessment.id);
      setAssessments(assessments.filter(a => a.id !== assessment.id));
      toast.success('Assessment deleted');
    } catch (error) {
      toast.error('Failed to delete assessment');
    }
  };

  const getJobTitle = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Assessments</h1>
          <p className="mt-2 text-stone-600">
            Create and manage job-specific assessments and quizzes for candidates
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <ClipboardDocumentListIcon className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 mb-2">No assessments found</h3>
            <p className="text-stone-600 mb-4">
              Create your first assessment to test candidates' skills
            </p>
            <Link to="/jobs" className="btn-primary">
              Create Assessment
            </Link>
          </div>
        ) : (
          assessments.map((assessment) => (
            <div key={assessment.id} className="card p-6 hover:shadow-medium transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    {assessment.title}
                  </h3>
                  <div className="flex items-center text-sm text-stone-500 mb-2">
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
                    {getJobTitle(assessment.jobId)}
                  </div>
                  {assessment.description && (
                    <p className="text-sm text-stone-600 line-clamp-2 mb-3">
                      {assessment.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-stone-400 space-x-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {formatDate(assessment.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <ClipboardDocumentListIcon className="h-3 w-3 mr-1" />
                      {assessment.sections?.length || 0} sections
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-stone-200">
                <Link
                  to={`/assessments/${assessment.jobId}`}
                  className="btn-secondary flex-1 text-center"
                >
                  <PencilIcon className="h-4 w-4 inline-block mr-2" />
                  Edit
                </Link>
                <Link
                  to={`/assessments/${assessment.jobId}`}
                  className="btn-ghost flex-1 text-center"
                >
                  <EyeIcon className="h-4 w-4 inline-block mr-2" />
                  View
                </Link>
                <button
                  onClick={() => handleDelete(assessment)}
                  className="btn-ghost text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssessmentsPage;


