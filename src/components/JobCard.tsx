import React from 'react';
import { Link } from 'react-router-dom';
import { 
  EyeIcon, 
  PencilIcon, 
  ArchiveBoxIcon,
  ArrowsUpDownIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onEdit: () => void;
  onArchive: () => void;
  onView: () => void;
  isReordering?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onEdit, 
  onArchive, 
  onView, 
  isReordering = false 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white hover:bg-stone-50 transition-colors ${
        isDragging ? 'opacity-50 z-50' : ''
      } ${isReordering ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
            >
              <ArrowsUpDownIcon className="h-5 w-5 text-stone-400" />
            </div>

            {/* Job Title and Status */}
            <div className="ml-6">
              <div className="flex items-center space-x-3">
                <Link
                  to={`/jobs/${job.id}`}
                  className="text-lg font-semibold text-stone-900 hover:text-sage-600 transition-colors"
                >
                  {job.title}
                </Link>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  job.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-stone-100 text-stone-800'
                }`}>
                  {job.status}
                </span>
              </div>

              {/* Job Description */}
              {job.description && (
                <p className="mt-2 text-stone-600 line-clamp-2">
                  {job.description}
                </p>
              )}

              {/* Tags */}
              {job.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-sage-100 text-sage-700"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta Information */}
              <div className="mt-4 flex items-center space-x-4 text-sm text-stone-500">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Created {formatDate(job.createdAt)}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Updated {formatDate(job.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onView}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              title="View Job"
            >
              <EyeIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-stone-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
              title="Edit Job"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onArchive}
              className={`p-2 rounded-lg transition-colors ${
                job.status === 'active'
                  ? 'text-stone-400 hover:text-orange-600 hover:bg-orange-50'
                  : 'text-stone-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={job.status === 'active' ? 'Archive Job' : 'Activate Job'}
            >
              <ArchiveBoxIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
