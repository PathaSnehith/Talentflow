import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  Squares2X2Icon,
  QueueListIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useCandidateStore } from '../store';
import { db } from '../db';
import CandidatesList from '../components/CandidatesList';
import toast from 'react-hot-toast';

const CandidatesPage = () => {
  const { 
    candidates, 
    setCandidates,
    loading, 
    setLoading 
  } = useCandidateStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const navigate = useNavigate();

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const allCandidates = await db.candidates.toArray();
      setCandidates(allCandidates);
    } catch (err) {
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleCandidateClick = (candidate) => {
    navigate(`/candidates/${candidate.id}`);
  };

  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
  const stageLabels = {
    applied: 'Applied',
    screen: 'Screening',
    tech: 'Technical',
    offer: 'Offer',
    hired: 'Hired',
    rejected: 'Rejected'
  };

  const stageColors = {
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    screen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    tech: 'bg-purple-100 text-purple-800 border-purple-200',
    offer: 'bg-green-100 text-green-800 border-green-200',
    hired: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  const getCandidatesByStage = (stage) => {
    let filtered = candidates;
    if (searchTerm) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.filter(candidate => candidate.stage === stage);
  };

  const candidateCount = searchTerm 
    ? candidates.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
      ).length
    : candidates.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Candidates</h1>
          <p className="mt-2 text-stone-600">
            Manage candidate applications and track their progress through the hiring pipeline
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-stone-600">
            {candidateCount} candidates
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
            className="btn-secondary flex items-center"
          >
            {viewMode === 'list' ? (
              <>
                <Squares2X2Icon className="h-5 w-5 mr-2" />
                Kanban
              </>
            ) : (
              <>
                <QueueListIcon className="h-5 w-5 mr-2" />
                List
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Stages</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>
                {stageLabels[stage]}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2">
            <UserGroupIcon className="h-5 w-5 text-stone-400" />
            <span className="text-sm font-medium text-stone-700">
              Showing {candidateCount} candidates
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <CandidatesList
          candidates={candidates}
          searchTerm={searchTerm}
          stageFilter={stageFilter}
          onCandidateClick={handleCandidateClick}
        />
      ) : (
        <div className="grid grid-cols-6 gap-4">
          {stages.map(stage => {
            const stageCandidates = getCandidatesByStage(stage);
            return (
              <div key={stage} className="card">
                <div className={`p-3 border-b-2 ${stageColors[stage]}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{stageLabels[stage]}</h3>
                    <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-xs font-medium">
                      {stageCandidates.length}
                    </span>
                  </div>
                </div>
                <div className="p-2 space-y-2 max-h-96 overflow-y-auto">
                  {stageCandidates.map(candidate => (
                    <div
                      key={candidate.id}
                      onClick={() => handleCandidateClick(candidate)}
                      className="p-3 bg-stone-50 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-6 w-6 bg-sage-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sage-700 font-medium text-xs">
                            {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-stone-900 truncate">
                          {candidate.name}
                        </p>
                      </div>
                      <p className="text-xs text-stone-500 truncate">
                        {candidate.email}
                      </p>
                      {candidate.experience && (
                        <p className="text-xs text-stone-400 mt-1">
                          {candidate.experience} yrs exp
                        </p>
                      )}
                    </div>
                  ))}
                  {stageCandidates.length === 0 && (
                    <div className="p-3 text-center text-stone-400 text-sm">
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CandidatesPage;


