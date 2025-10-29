import Dexie from 'dexie';
import { generateSeedData } from '../utils/seedData';

export class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, slug, status, order, createdAt, updatedAt',
      candidates: 'id, name, email, stage, jobId, appliedAt, updatedAt',
      candidateTimeline: 'id, candidateId, stage, timestamp',
      assessments: 'id, jobId, title, createdAt, updatedAt',
      assessmentResponses: 'id, assessmentId, candidateId, submittedAt, createdAt'
    });
  }
}

export const db = new TalentFlowDB();

export const initializeDB = async () => {
  try {
    const jobCount = await db.jobs.count();
    if (jobCount === 0) {
      await seedDatabase();
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

const seedDatabase = async () => {
  await generateSeedData();
};


