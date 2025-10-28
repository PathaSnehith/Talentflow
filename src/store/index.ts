import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job, Candidate, Assessment, JobFilters, CandidateFilters } from '../types';

interface JobStore {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  
  // Actions
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  reorderJobs: (fromOrder: number, toOrder: number) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface CandidateStore {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  filters: CandidateFilters;
  
  // Actions
  setCandidates: (candidates: Candidate[]) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  moveCandidateStage: (id: string, stage: Candidate['stage']) => void;
  setFilters: (filters: Partial<CandidateFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface AssessmentStore {
  assessments: Assessment[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setAssessments: (assessments: Assessment[]) => void;
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: [],
      loading: false,
      error: null,
      filters: {
        page: 1,
        pageSize: 10,
        sort: 'order'
      },
      
      setJobs: (jobs) => set({ jobs }),
      addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
      updateJob: (id, updates) => set((state) => ({
        jobs: state.jobs.map(job => job.id === id ? { ...job, ...updates } : job)
      })),
      deleteJob: (id) => set((state) => ({
        jobs: state.jobs.filter(job => job.id !== id)
      })),
      reorderJobs: (fromOrder, toOrder) => set((state) => {
        const jobs = [...state.jobs];
        const fromIndex = jobs.findIndex(job => job.order === fromOrder);
        const toIndex = jobs.findIndex(job => job.order === toOrder);
        
        if (fromIndex !== -1 && toIndex !== -1) {
          const [movedJob] = jobs.splice(fromIndex, 1);
          jobs.splice(toIndex, 0, movedJob);
          
          // Update order values
          jobs.forEach((job, index) => {
            job.order = index + 1;
          });
        }
        
        return { jobs };
      }),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'job-store',
      partialize: (state) => ({ jobs: state.jobs, filters: state.filters }),
    }
  )
);

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set, get) => ({
      candidates: [],
      loading: false,
      error: null,
      filters: {
        page: 1,
        pageSize: 20
      },
      
      setCandidates: (candidates) => set({ candidates }),
      addCandidate: (candidate) => set((state) => ({ 
        candidates: [...state.candidates, candidate] 
      })),
      updateCandidate: (id, updates) => set((state) => ({
        candidates: state.candidates.map(candidate =>
          candidate.id === id ? { ...candidate, ...updates } : candidate
        )
      })),
      moveCandidateStage: (id, stage) => set((state) => ({
        candidates: state.candidates.map(candidate =>
          candidate.id === id ? { ...candidate, stage, updatedAt: new Date().toISOString() } : candidate
        )
      })),
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'candidate-store',
      partialize: (state) => ({ candidates: state.candidates, filters: state.filters }),
    }
  )
);

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      assessments: [],
      loading: false,
      error: null,
      
      setAssessments: (assessments) => set({ assessments }),
      addAssessment: (assessment) => set((state) => ({ 
        assessments: [...state.assessments, assessment] 
      })),
      updateAssessment: (id, updates) => set((state) => ({
        assessments: state.assessments.map(assessment => 
          assessment.id === id ? { ...assessment, ...updates } : assessment
        )
      })),
      deleteAssessment: (id) => set((state) => ({
        assessments: state.assessments.filter(assessment => assessment.id !== id)
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'assessment-store',
      partialize: (state) => ({ assessments: state.assessments }),
    }
  )
);
