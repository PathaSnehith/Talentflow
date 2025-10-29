import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { db } from '../db';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const shouldError = () => Math.random() < 0.08;

const handlers = [
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
    if (search) {
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (status) {
      jobs = jobs.filter(job => job.status === status);
    }
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
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    const response = {
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
    const job = await request.json();
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
    const updates = await request.json();
    updates.updatedAt = new Date().toISOString();
    await db.jobs.update(id, updates);
    const updatedJob = await db.jobs.get(id);
    return HttpResponse.json(updatedJob);
  }),

  http.patch('/api/jobs/:id/reorder', async ({ request }) => {
    await delay(200 + Math.random() * 1000);
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to reorder jobs' }, { status: 500 });
    }
    const { fromOrder, toOrder } = await request.json();
    const jobs = await db.jobs.toArray();
    const fromIndex = jobs.findIndex(job => job.order === fromOrder);
    const toIndex = jobs.findIndex(job => job.order === toOrder);
    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedJob] = jobs.splice(fromIndex, 1);
      jobs.splice(toIndex, 0, movedJob);
      for (let i = 0; i < jobs.length; i++) {
        await db.jobs.update(jobs[i].id, { order: i + 1 });
      }
    }
    return HttpResponse.json({ success: true });
  }),

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
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCandidates = candidates.slice(startIndex, endIndex);
    const response = {
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
    const candidate = await request.json();
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
    const updates = await request.json();
    updates.updatedAt = new Date().toISOString();
    await db.candidates.update(id, updates);
    const updatedCandidate = await db.candidates.get(id);
    return HttpResponse.json(updatedCandidate);
  }),

  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    const { id } = params;
    const timeline = await db.candidateTimeline
      .where('candidateId')
      .equals(id)
      .toArray();
    return HttpResponse.json(timeline);
  }),

  http.get('/api/assessments/:jobId', async ({ params }) => {
    await delay(200 + Math.random() * 1000);
    const { jobId } = params;
    const assessment = await db.assessments
      .where('jobId')
      .equals(jobId)
      .first();
    return HttpResponse.json(assessment);
  }),

  http.put('/api/assessments/:jobId', async ({ request, params }) => {
    await delay(200 + Math.random() * 1000);
    if (shouldError()) {
      return HttpResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }
    const { jobId } = params;
    const assessment = await request.json();
    const existing = await db.assessments
      .where('jobId')
      .equals(jobId)
      .first();
    if (existing) {
      assessment.updatedAt = new Date().toISOString();
      await db.assessments.update(existing.id, assessment);
    } else {
      assessment.id = crypto.randomUUID();
      assessment.jobId = jobId;
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
    const response = await request.json();
    response.id = crypto.randomUUID();
    response.assessmentId = jobId;
    response.createdAt = new Date().toISOString();
    response.submittedAt = new Date().toISOString();
    await db.assessmentResponses.add(response);
    return HttpResponse.json(response, { status: 201 });
  }),
];

export const worker = setupWorker(...handlers);


