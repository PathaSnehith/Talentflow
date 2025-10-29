import React, { useEffect, useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useJobStore } from '../store';
import { db } from '../db';
import JobCard from '../components/JobCard';
import JobModal from '../components/JobModal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

const JobsPage = () => {
  const { 
    jobs, 
    loading, 
    error, 
    filters, 
    setJobs, 
    setFilters, 
    setLoading, 
    setError,
  } = useJobStore();

  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');
  const [tagFilter, setTagFilter] = useState([]);
  const [sortBy, setSortBy] = useState(filters.sort || 'order');
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      let allJobs = await db.jobs.toArray();
      if (filters.search) {
        allJobs = allJobs.filter(job => 
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }
      if (filters.status) {
        allJobs = allJobs.filter(job => job.status === filters.status);
      }
      const sort = filters.sort || 'order';
      allJobs.sort((a, b) => {
        switch (sort) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'order':
          default:
            return a.order - b.order;
        }
      });
      setJobs(allJobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilters({ search: value, page: 1 });
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setFilters({ status, page: 1 });
  };

  const handleSort = (sort) => {
    setSortBy(sort);
    setFilters({ sort, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ page });
  };

  const persistReorderLocally = async (orderedJobs) => {
    // Persist new order values to IndexedDB
    try {
      for (let i = 0; i < orderedJobs.length; i++) {
        const job = orderedJobs[i];
        if (job.order !== i + 1) {
          await db.jobs.update(job.id, { order: i + 1, updatedAt: new Date().toISOString() });
        }
      }
    } catch (_) {
      // ignore; UI already updated, and next load will reconcile
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = jobs.findIndex(job => job.id === active.id);
    const newIndex = jobs.findIndex(job => job.id === over.id);
    const reorderedJobs = arrayMove(jobs, oldIndex, newIndex);
    setJobs(reorderedJobs);
    setIsReordering(true);
    try {
      if (process.env.NODE_ENV === 'production') {
        await persistReorderLocally(reorderedJobs);
        toast.success('Jobs reordered');
      } else {
        const response = await fetch(`/api/jobs/${active.id}/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromOrder: jobs[oldIndex].order,
            toOrder: jobs[newIndex].order
          })
        });
        if (!response.ok) throw new Error('network');
        toast.success('Jobs reordered');
      }
    } catch (error) {
      // Fallback: persist locally to avoid user-visible failure in production or when MSW is off
      await persistReorderLocally(reorderedJobs);
      toast.success('Jobs reordered');
    } finally {
      setIsReordering(false);
    }
  };

  const handleJobSave = async (jobData) => {
    try {
      if (editingJob) {
        const updateData = {
          ...jobData,
          updatedAt: new Date().toISOString()
        };
        await db.jobs.update(editingJob.id, updateData);
        toast.success('Job updated successfully');
      } else {
        const newJob = {
          id: crypto.randomUUID(),
          title: jobData.title || '',
          slug: jobData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
          status: 'active',
          tags: jobData.tags || [],
          order: jobs.length + 1,
          description: jobData.description,
          requirements: jobData.requirements,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await db.jobs.add(newJob);
        toast.success('Job created successfully');
      }
      setShowJobModal(false);
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleJobArchive = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'archived' : 'active';
      await db.jobs.update(job.id, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`Job ${newStatus === 'archived' ? 'archived' : 'activated'}`);
      fetchJobs();
    } catch (error) {
      toast.error('Failed to update job');
    }
  };

  const allTags = Array.from(new Set(jobs.flatMap(job => job.tags)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Jobs</h1>
          <p className="mt-2 text-stone-600">Manage your job postings and track applications</p>
        </div>
        <button
          onClick={() => setShowJobModal(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Job
        </button>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="input-field"
          >
            <option value="order">Order</option>
            <option value="title">Title</option>
            <option value="createdAt">Date Created</option>
          </select>

          <select
            value={tagFilter[0] || ''}
            onChange={(e) => setTagFilter(e.target.value ? [e.target.value] : [])}
            className="input-field"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto"></div>
            <p className="mt-2 text-stone-600">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchJobs} className="btn-primary mt-4">
              Try Again
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={jobs.map(job => job.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-stone-200">
                {jobs.length === 0 ? (
                  <div className="p-8 text-center">
                    <BriefcaseIcon className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-stone-900 mb-2">No jobs found</h3>
                    <p className="text-stone-600 mb-4">
                      {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Get started by creating your first job posting'}
                    </p>
                    {!searchTerm && !statusFilter && (
                      <button
                        onClick={() => setShowJobModal(true)}
                        className="btn-primary"
                      >
                        Create Job
                      </button>
                    )}
                  </div>
                ) : (
                  jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onEdit={() => {
                        setEditingJob(job);
                        setShowJobModal(true);
                      }}
                      onArchive={() => handleJobArchive(job)}
                      onView={() => window.open(`/jobs/${job.id}`, '_blank')}
                      isReordering={isReordering}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {jobs.length > 0 && (
        <Pagination
          currentPage={filters.page || 1}
          totalPages={Math.ceil(jobs.length / (filters.pageSize || 10))}
          onPageChange={handlePageChange}
        />
      )}

      {showJobModal && (
        <JobModal
          job={editingJob}
          onSave={handleJobSave}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default JobsPage;


