import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  UserCircleIcon,
  PencilIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { db } from '../db';
import { useCandidateStore } from '../store';
import toast from 'react-hot-toast';

const CandidateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateCandidate } = useCandidateStore();
  
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const fetchCandidate = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const candidateData = await db.candidates.get(id);
      if (candidateData) {
        setCandidate(candidateData);
        setNotes(candidateData.notes || '');
        const timelineEvents = [
          {
            id: '1',
            stage: 'applied',
            timestamp: candidateData.appliedAt,
            notes: 'Application submitted'
          }
        ];
        if (candidateData.updatedAt !== candidateData.appliedAt) {
          timelineEvents.push({
            id: '2',
            stage: candidateData.stage,
            timestamp: candidateData.updatedAt,
            notes: 'Status updated'
          });
        }
        setTimeline(timelineEvents);
      } else {
        toast.error('Candidate not found');
        navigate('/candidates');
      }
    } catch (error) {
      toast.error('Failed to load candidate');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (newStage) => {
    if (!candidate) return;
    try {
      const updatedCandidate = {
        ...candidate,
        stage: newStage,
        updatedAt: new Date().toISOString()
      };
      await db.candidates.update(id, updatedCandidate);
      setCandidate(updatedCandidate);
      updateCandidate(id, updatedCandidate);
      toast.success(`Moved to ${newStage} stage`);
      setTimeline(prev => [...prev, {
        id: crypto.randomUUID(),
        stage: newStage,
        timestamp: updatedCandidate.updatedAt,
        notes: 'Status changed'
      }]);
    } catch (error) {
      toast.error('Failed to update candidate');
    }
  };

  const handleSaveNotes = async () => {
    if (!candidate || !id) return;
    try {
      await db.candidates.update(id, {
        notes,
        updatedAt: new Date().toISOString()
      });
      setCandidate({ ...candidate, notes });
      setShowNotesInput(false);
      toast.success('Notes saved');
    } catch (error) {
      toast.error('Failed to save notes');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Candidate Not Found</h2>
        <p className="text-stone-600 mb-6">The candidate you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/candidates')} className="btn-primary">
          Back to Candidates
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/candidates')}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{candidate.name}</h1>
            <p className="mt-2 text-stone-600">{candidate.email}</p>
          </div>
        </div>
        
        <select
          value={candidate.stage}
          onChange={(e) => handleStageChange(e.target.value)}
          className="input-field w-auto min-w-[150px]"
        >
          {stages.map(stage => (
            <option key={stage} value={stage}>
              {getStageLabel(stage)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Candidate Information</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="h-5 w-5 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Name</p>
                  <p className="text-stone-900 font-medium">{candidate.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Email</p>
                  <p className="text-stone-900 font-medium">{candidate.email}</p>
                </div>
              </div>
              {candidate.phone && (
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-500">Phone</p>
                    <p className="text-stone-900 font-medium">{candidate.phone}</p>
                  </div>
                </div>
              )}
              {candidate.experience && (
                <div className="flex items-center space-x-3">
                  <BriefcaseIcon className="h-5 w-5 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-500">Experience</p>
                    <p className="text-stone-900 font-medium">{candidate.experience} years</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Applied At</p>
                  <p className="text-stone-900 font-medium">{formatDate(candidate.appliedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-sage-600 rounded-full mt-2"></div>
                    {index < timeline.length - 1 && (
                      <div className="h-8 w-0.5 bg-stone-200 ml-1"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(event.stage)}`}>
                        {getStageLabel(event.stage)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-600 mt-1">{event.notes}</p>
                    <p className="text-xs text-stone-400 mt-1">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-stone-900">Notes</h2>
              <button
                onClick={() => setShowNotesInput(!showNotesInput)}
                className="btn-ghost text-sm"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Notes
              </button>
            </div>
            {showNotesInput ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Add notes about this candidate..."
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowNotesInput(false);
                      setNotes(candidate.notes || '');
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="btn-primary"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-stone-700 whitespace-pre-wrap">
                {candidate.notes || (
                  <span className="text-stone-400 italic">No notes added yet</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {stages.map(stage => (
                candidate.stage !== stage && (
                  <button
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    className="w-full btn-secondary text-left flex items-center"
                  >
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(stage)} mr-2`}>
                      {getStageLabel(stage)}
                    </span>
                    Move to {getStageLabel(stage)}
                  </button>
                )
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Status Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-stone-500">Current Stage</span>
                <span className={`inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}>
                  {getStageLabel(candidate.stage)}
                </span>
              </div>
              <div>
                <span className="text-sm text-stone-500">Last Updated</span>
                <p className="text-sm text-stone-900 font-medium mt-1">
                  {formatDate(candidate.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailPage;


