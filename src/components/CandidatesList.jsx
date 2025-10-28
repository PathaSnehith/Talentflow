import React, { useMemo } from 'react';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

const CandidatesList = ({ candidates, searchTerm, stageFilter, onCandidateClick }) => {
  const filteredCandidates = useMemo(() => {
    let filtered = candidates;

    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (stageFilter) {
      filtered = filtered.filter(candidate => candidate.stage === stageFilter);
    }

    return filtered;
  }, [candidates, searchTerm, stageFilter]);

  const getStageColor = (stage) => {
    const colors = {
      applied: 'bg-blue-100 text-blue-800',
      screen: 'bg-yellow-100 text-yellow-800',
      tech: 'bg-purple-100 text-purple-800',
      offer: 'bg-green-100 text-green-800',
      hired: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-stone-100 text-stone-800';
  };

  const getStageLabel = (stage) => {
    const labels = {
      applied: 'Applied',
      screen: 'Screening',
      tech: 'Technical',
      offer: 'Offer',
      hired: 'Hired',
      rejected: 'Rejected'
    };
    return labels[stage] || stage;
  };

  if (filteredCandidates.length === 0) {
    return (
      <div className="p-8 text-center">
        <UserCircleIcon className="h-12 w-12 text-stone-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-stone-900 mb-2">No candidates found</h3>
        <p className="text-stone-600">
          {searchTerm || stageFilter ? 'Try adjusting your filters' : 'No candidates available'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden max-h-[600px] overflow-y-auto">
      {filteredCandidates.map((candidate) => (
        <div
          key={candidate.id}
          onClick={() => onCandidateClick(candidate)}
          className="px-4 py-3 border-b border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-sage-100 rounded-full flex items-center justify-center">
                  <span className="text-sage-700 font-medium text-sm">
                    {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">
                  {candidate.name}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-xs text-stone-500">
                    <EnvelopeIcon className="h-3 w-3 mr-1" />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center text-xs text-stone-500">
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                  {getStageLabel(candidate.stage)}
                </span>
                {candidate.experience && (
                  <span className="text-xs text-stone-500">
                    {candidate.experience} yrs
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CandidatesList;


