export interface Job {
  id: string;
  title: string;
  slug: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  description?: string;
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  jobId: string;
  appliedAt: string;
  updatedAt: string;
  notes?: string;
  resume?: string;
  phone?: string;
  experience?: number;
}

export interface CandidateTimelineEvent {
  id: string;
  candidateId: string;
  stage: string;
  timestamp: string;
  notes?: string;
  userId?: string;
}

export interface Assessment {
  id: string;
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: AssessmentQuestion[];
  order: number;
}

export interface AssessmentQuestion {
  id: string;
  type: 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  conditionalLogic?: ConditionalLogic;
  order: number;
}

export interface ConditionalLogic {
  dependsOn: string; // question ID
  condition: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  value: string | number;
}

export interface AssessmentResponse {
  id: string;
  assessmentId: string;
  candidateId: string;
  responses: QuestionResponse[];
  submittedAt?: string;
  createdAt: string;
}

export interface QuestionResponse {
  questionId: string;
  value: string | string[] | number | File;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface JobFilters {
  search?: string;
  status?: 'active' | 'archived';
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: 'title' | 'createdAt' | 'order';
}

export interface CandidateFilters {
  search?: string;
  stage?: string;
  jobId?: string;
  page?: number;
  pageSize?: number;
}

export interface DragDropResult {
  fromOrder: number;
  toOrder: number;
}

export interface MentionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
