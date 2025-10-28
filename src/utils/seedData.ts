import { db } from '../db';
import { Job, Candidate, Assessment, AssessmentSection, AssessmentQuestion } from '../types';

const jobTitles = [
  'Senior Frontend Developer',
  'Full Stack Engineer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'DevOps Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Data Scientist',
  'Machine Learning Engineer',
  'Backend Developer',
  'Mobile App Developer',
  'QA Engineer',
  'Technical Writer',
  'Solutions Architect',
  'Cloud Engineer',
  'Security Engineer',
  'Database Administrator',
  'Scrum Master',
  'Business Analyst',
  'Marketing Manager',
  'Sales Representative',
  'Customer Success Manager',
  'Content Creator',
  'Graphic Designer'
];

const tags = [
  'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes',
  'Machine Learning', 'Data Science', 'UI/UX', 'Agile', 'Scrum', 'DevOps',
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'Web', 'Cloud', 'Security'
];

const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kendall',
  'Logan', 'Parker', 'Reese', 'Sage', 'Skyler', 'Sydney', 'Tatum', 'River'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson'
];

const companies = [
  'TechCorp', 'InnovateLab', 'DataFlow', 'CloudScale', 'DevSolutions', 'CodeCraft',
  'NextGen', 'FutureTech', 'SmartSystems', 'DigitalWorks', 'AppForge', 'WebCraft'
];

const stages: Candidate['stage'][] = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

export async function generateSeedData() {
  console.log('Generating seed data...');

  // Generate Jobs
  const jobs: Job[] = [];
  for (let i = 0; i < 25; i++) {
    const title = getRandomElement(jobTitles);
    const job: Job = {
      id: crypto.randomUUID(),
      title: `${title} - ${getRandomElement(companies)}`,
      slug: generateSlug(title),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: getRandomElements(tags, Math.floor(Math.random() * 4) + 1),
      order: i + 1,
      description: `We are looking for a talented ${title.toLowerCase()} to join our team. This role involves working on exciting projects and collaborating with a diverse team of professionals.`,
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '3+ years of relevant experience',
        'Strong problem-solving skills',
        'Excellent communication skills',
        'Ability to work in a team environment'
      ],
      createdAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: generateRandomDate(new Date(2023, 0, 1), new Date())
    };
    jobs.push(job);
  }

  await db.jobs.bulkAdd(jobs);
  console.log(`Generated ${jobs.length} jobs`);

  // Generate Candidates
  const candidates: Candidate[] = [];
  for (let i = 0; i < 1000; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const candidate: Candidate = {
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      stage: getRandomElement(stages),
      jobId: getRandomElement(jobs).id,
      appliedAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
      phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      experience: Math.floor(Math.random() * 10) + 1,
      notes: Math.random() > 0.7 ? 'Strong technical background and excellent communication skills.' : undefined
    };
    candidates.push(candidate);
  }

  await db.candidates.bulkAdd(candidates);
  console.log(`Generated ${candidates.length} candidates`);

  // Generate Assessments
  const assessments: Assessment[] = [];
  const selectedJobs = jobs.slice(0, 3); // Create assessments for first 3 jobs

  for (const job of selectedJobs) {
    const assessment: Assessment = {
      id: crypto.randomUUID(),
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Complete this assessment to demonstrate your skills and knowledge relevant to the ${job.title} position.`,
      sections: generateAssessmentSections(),
      createdAt: generateRandomDate(new Date(2023, 0, 1), new Date()),
      updatedAt: generateRandomDate(new Date(2023, 0, 1), new Date())
    };
    assessments.push(assessment);
  }

  await db.assessments.bulkAdd(assessments);
  console.log(`Generated ${assessments.length} assessments`);

  console.log('Seed data generation completed!');
}

function generateAssessmentSections(): AssessmentSection[] {
  const sections: AssessmentSection[] = [];
  
  // Technical Skills Section
  sections.push({
    id: crypto.randomUUID(),
    title: 'Technical Skills',
    description: 'Please answer the following technical questions.',
    order: 1,
    questions: [
      {
        id: crypto.randomUUID(),
        type: 'single-choice',
        title: 'What is your primary programming language?',
        required: true,
        options: ['JavaScript', 'Python', 'Java', 'C#', 'Go', 'Rust'],
        order: 1
      },
      {
        id: crypto.randomUUID(),
        type: 'multi-choice',
        title: 'Which technologies have you worked with? (Select all that apply)',
        required: true,
        options: ['React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot'],
        order: 2
      },
      {
        id: crypto.randomUUID(),
        type: 'numeric',
        title: 'How many years of experience do you have in software development?',
        required: true,
        min: 0,
        max: 20,
        order: 3
      }
    ]
  });

  // Problem Solving Section
  sections.push({
    id: crypto.randomUUID(),
    title: 'Problem Solving',
    description: 'Demonstrate your problem-solving abilities.',
    order: 2,
    questions: [
      {
        id: crypto.randomUUID(),
        type: 'long-text',
        title: 'Describe a challenging technical problem you solved recently.',
        required: true,
        maxLength: 1000,
        order: 1
      },
      {
        id: crypto.randomUUID(),
        type: 'short-text',
        title: 'What debugging tools do you typically use?',
        required: false,
        maxLength: 200,
        order: 2
      }
    ]
  });

  // Experience Section
  sections.push({
    id: crypto.randomUUID(),
    title: 'Experience & Background',
    description: 'Tell us about your professional experience.',
    order: 3,
    questions: [
      {
        id: crypto.randomUUID(),
        type: 'single-choice',
        title: 'Have you worked in an agile environment before?',
        required: true,
        options: ['Yes', 'No'],
        order: 1,
        conditionalLogic: {
          dependsOn: 'previous-question-id', // This would reference another question
          condition: 'equals',
          value: 'Yes'
        }
      },
      {
        id: crypto.randomUUID(),
        type: 'long-text',
        title: 'Describe your experience with agile methodologies.',
        required: false,
        maxLength: 500,
        order: 2
      },
      {
        id: crypto.randomUUID(),
        type: 'file-upload',
        title: 'Upload your resume (PDF, DOC, DOCX)',
        required: true,
        order: 3
      }
    ]
  });

  return sections;
}
