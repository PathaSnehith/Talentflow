import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { db } from '../db';
import { Job, Candidate, Assessment, AssessmentResponse, PaginatedResponse } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate random errors (5-10% error rate)
const shouldError = () => Math.random() < 0.08;

const handlers = [
  // Jobs API
  http.get('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const sort = url.searchParams.get('sort') || 'order';

    let jobs = await db.jobs.toArray();

    // Apply filters
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }

    // Apply sorting
    jobs.sort((a, b) => {
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

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = jobs.slice(startIndex, endIndex);

    const response: PaginatedResponse<Job> = {
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total: jobs.length,
        totalPages: Math.ceil(jobs.length / pageSize)
      }
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/jobs', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const job = await request.json() as Job;
    job.id = crypto.randomUUID();
    job.createdAt = new Date().toISOString();
    job.updatedAt = new Date().toISOString();
    
    await db.jobs.add(job);
    return HttpResponse.json(job, { status: 201 });
  }),

  http.patch('/api/jobs/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    const { id } = params;
    const updates = await request.json() as Partial<Job>;
    updates.updatedAt = new Date().toISOString();
    
    await db.jobs.update(id as string, updates);
    const updatedJob = await db.jobs.get(id as string);
    
    return HttpResponse.json(updatedJob);
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to reorder jobs' }, { status: 500 });
    }

    const { id } = params;
    const { fromOrder, toOrder } = await request.json() as { fromOrder: number; toOrder: number };
    
    // Get all jobs and reorder them
    const jobs = await db.jobs.toArray();
    const fromIndex = jobs.findIndex(job => job.order === fromOrder);
    const toIndex = jobs.findIndex(job => job.order === toOrder);
    
    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedJob] = jobs.splice(fromIndex, 1);
      jobs.splice(toIndex, 0, movedJob);
      
      // Update order values
      for (let i = 0; i < jobs.length; i++) {
        await db.jobs.update(jobs[i].id, { order: i + 1 });
      }
    }
    
    return HttpResponse.json({ success: true });
  }),

  // Candidates API
  http.get('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const stage = url.searchParams.get('stage') || '';
    const jobId = url.searchParams.get('jobId') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let candidates = await db.candidates.toArray();

    // Apply filters
    if (search) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (stage) {
      candidates = candidates.filter(candidate => candidate.stage === stage);
    }

    if (jobId) {
      candidates = candidates.filter(candidate => candidate.jobId === jobId);
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCandidates = candidates.slice(startIndex, endIndex);

    const response: PaginatedResponse<Candidate> = {
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total: candidates.length,
        totalPages: Math.ceil(candidates.length / pageSize)
      }
    };

    return HttpResponse.json(response);
  }),

  http.post('/api/candidates', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }

    const candidate = await request.json() as Candidate;
    candidate.id = crypto.randomUUID();
    candidate.appliedAt = new Date().toISOString();
    candidate.updatedAt = new Date().toISOString();
    
    await db.candidates.add(candidate);
    return HttpResponse.json(candidate, { status: 201 });
  }),

  http.patch('/api/candidates/:id', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }

    const { id } = params;
    const updates = await request.json() as Partial<Candidate>;
    updates.updatedAt = new Date().toISOString();
    
    await db.candidates.update(id as string, updates);
    const updatedCandidate = await db.candidates.get(id as string);
    
    return HttpResponse.json(updatedCandidate);
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { id } = params;
    const timeline = await db.candidateTimeline
      .where('candidateId')
      .equals(id as string)
      .toArray();
    
    return HttpResponse.json(timeline);
  }),

  // Assessments API
  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    
    const { jobId } = params;
    const assessment = await db.assessments
      .where('jobId')
      .equals(jobId as string)
      .first();
    
    return HttpResponse.json(assessment);
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    const { jobId } = params;
    const assessment = await request.json() as Assessment;
    
    const existing = await db.assessments
      .where('jobId')
      .equals(jobId as string)
      .first();
    
    if (existing) {
      assessment.updatedAt = new Date().toISOString();
      await db.assessments.update(existing.id, assessment as any);
    } else {
      assessment.id = crypto.randomUUID();
      assessment.jobId = jobId as string;
      assessment.createdAt = new Date().toISOString();
      assessment.updatedAt = new Date().toISOString();
      await db.assessments.add(assessment);
    }
    
    return HttpResponse.json(assessment);
  }),

  http.post('/api/assessments/:jobId/submit', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }

    const { jobId } = params;
    const response = await request.json() as AssessmentResponse;
    
    response.id = crypto.randomUUID();
    response.assessmentId = jobId as string;
    response.createdAt = new Date().toISOString();
    response.submittedAt = new Date().toISOString();
    
    await db.assessmentResponses.add(response);
    return HttpResponse.json(response, { status: 201 });
  }),
];

export const worker = setupWorker(...handlers);