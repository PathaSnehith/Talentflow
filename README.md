# TalentFlow – Mini Hiring Platform

TalentFlow is a small React app I built to practice common HR workflows without a backend. It manages jobs, candidates, and quick assessments, and stores everything locally (IndexedDB) so a refresh doesn’t wipe your work.

## 🚀 Live Application

**Deployed App:** Deploy on Netlify  
**GitHub Repository:** View on GitHub

## ✨ What it does

### 1. Jobs Management ✅
- Create, edit, archive, and reorder jobs with drag-and-drop
- Server-like pagination and filtering (title, status, tags)
- Deep linking to individual job pages (`/jobs/:jobId`)
- Optimistic updates with rollback on failure
- Beautiful job cards with hover effects
- Job validation (title required, unique slug)
- Archive/unarchive functionality
- Real-time search and filtering

### 2. Candidates Management ✅
- Virtualized list for 1000+ candidates
- Client-side search by name/email
- Stage filtering (applied, screen, tech, offer, hired, rejected)
- Kanban board view with drag-and-drop
- Candidate profile pages (`/candidates/:id`)
- Timeline of status changes
- Notes with @mentions support
- Move candidates between stages dynamically
- View candidate details and history

### 3. Assessments ✅
- Assessment builder per job
- Multiple question types:
  - Single-choice questions
  - Multi-choice questions
  - Short text
  - Long text
  - Numeric with range validation
  - File upload stub
- Live preview pane that updates in real-time
- Conditional questions (show based on previous answers)
- Persist builder state locally
- Add sections and questions dynamically
- Form validation (required, numeric range, max length)

### 4. Dashboard ✅
- Real-time statistics and metrics
- Candidate pipeline visualization
- Recent activity feed
- Quick action buttons
- Hiring rate calculation
- Beautiful data visualization

## 🏗️ Architecture at a glance

### Tech Stack
- **Frontend:** React 19.2 (JavaScript)
- **State Management:** Zustand with persistence
- **Database:** IndexedDB via Dexie
- **Routing:** React Router v7
- **UI Framework:** Tailwind CSS with custom components
- **Drag-and-Drop:** @dnd-kit
- **Icons:** Heroicons
- **Notifications:** React Hot Toast
- **Forms:** React Hook Form
- **Date Management:** Native JavaScript Date API

### Project structure
```
talentflow/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx       # Main layout with sidebar
│   │   ├── JobCard.jsx      # Job listing card
│   │   ├── JobModal.jsx     # Job create/edit modal
│   │   ├── Pagination.jsx   # Pagination component
│   │   ├── CandidatesList.jsx
│   │   └── MentionsList.jsx
│   ├── pages/               # Page components
│   │   ├── DashboardPage.jsx
│   │   ├── JobsPage.jsx
│   │   ├── JobDetailPage.jsx
│   │   ├── CandidatesPage.jsx
│   │   ├── CandidateDetailPage.jsx
│   │   ├── AssessmentsPage.jsx
│   │   └── AssessmentBuilderPage.jsx
│   ├── store/               # Zustand state management
│   │   └── index.js
│   ├── db/                  # IndexedDB setup
│   │   └── index.js
│   ├── mocks/               # MSW handlers (for future API)
│   │   └── handlers.js
│   ├── utils/               # Utility functions
│   │   └── seedData.js
│   ├── App.jsx              # Main app component
│   └── index.jsx            # Entry point
```

### State management
- **Zustand stores** for jobs, candidates, and assessments
- **Persistent storage** using Zustand's persist middleware
- **Local-first** approach with IndexedDB backup
- **Optimistic updates** for better UX
- **Automatic rollback** on failures

### Data Flow
1. User interactions trigger store actions
2. Store updates UI optimistically
3. Changes persisted to IndexedDB
4. On refresh, state restored from IndexedDB
5. No external API dependency

### Design system
- **Natural Color Palette:** Sage, moss, stone, and earth tones
- **Typography:** Inter (body), Crimson Text (headings), JetBrains Mono (code)
- **Components:** Reusable cards, buttons, inputs with consistent styling
- **Animations:** Fade, slide, and scale transitions
- **Responsive Design:** Mobile-first approach

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/talentflow.git
   cd talentflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

This creates a `build/` directory with optimized production files.

### Netlify deployment

1. Connect repo: New Site → Import from Git → choose `PathaSnehith/Talentflow`.
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Environment variables:
     - `NODE_VERSION=18`
     - `CI=false`
3. SPA redirects: ensure `public/_redirects` contains `/* /index.html 200`.
4. Deploy and copy the site URL. Add it to `DEPLOYMENT.md`.

### Screenshots

Add screenshots here after deployment (optional but recommended):

![Dashboard](./docs/images/dashboard.png)
![Jobs](./docs/images/jobs.png)
![Candidates Kanban](./docs/images/candidates-kanban.png)

## 📊 Seed data

The application comes pre-loaded with:
- **25 Jobs** (mixed active/archived with various tags)
- **1,000 Candidates** randomly assigned to jobs and stages
- **3 Assessments** with 10+ questions each

All data persists in browser's IndexedDB and survives page refreshes.

## 🔧 Technical decisions (short version)

**React (JavaScript)**
- Matches the assignment (React without TypeScript)
- Simple setup for a front‑end–only demo
- Big ecosystem and community

**Zustand**
- Minimal boilerplate compared to Redux
- Built-in persistence
- Simple API for complex state management
- Better performance than Context API

**IndexedDB via Dexie**
- No backend required for demo
- Offline-first architecture
- Handles large datasets efficiently
- Persistent across sessions

**Tailwind CSS**
- Rapid UI development
- Consistent design system
- Custom natural theme
- Easy to maintain and customize

**@dnd-kit**
- Modern, accessible drag-and-drop library
- Better than react-beautiful-dnd
- Supports keyboard navigation
- Optimistic updates out of the box

### Performance notes
- **Virtualization** for large lists (1000+ candidates)
- **Memoization** for expensive calculations
- **Optimistic updates** for instant feedback
- **Lazy loading** for route components
- **Code splitting** for smaller bundles

## ⚠️ Notes & trade‑offs

### 1. MSW Integration
**Issue:** Need a network layer with latency/errors but no backend.  
**Solution:** MSW enabled in development (`App.jsx`) with 200–1200ms delay and ~8% error on writes; data writes through to Dexie.

### 2. Candidate Drag-and-Drop in Kanban
**Issue:** Stage transitions should be intuitive.  
**Solution:** Implemented drag-and-drop between columns; updates persist to Dexie and Zustand.

### 3. Conditional Questions Preview
**Issue:** Conditional questions need runtime evaluation.  
**Solution:** Builder supports conditional logic configuration. Full runtime evaluation can be implemented.

### 4. File Upload
**Issue:** File upload is stubbed.  
**Solution:** Basic structure exists. Real file handling can be added.

## 📝 API endpoints (MSW – dev only)

The following API endpoints are defined but currently use direct IndexedDB access:

- `GET /api/jobs` - List jobs with pagination/filtering
- `POST /api/jobs` - Create new job
- `PATCH /api/jobs/:id` - Update job
- `PATCH /api/jobs/:id/reorder` - Reorder jobs
- `GET /api/candidates` - List candidates with filtering
- `POST /api/candidates` - Create candidate
- `PATCH /api/candidates/:id` - Update candidate
- `GET /api/candidates/:id/timeline` - Get candidate timeline
- `GET /api/assessments/:jobId` - Get assessment
- `PUT /api/assessments/:jobId` - Save assessment
- `POST /api/assessments/:jobId/submit` - Submit assessment response


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Acknowledgments

- Built with  using React, TypeScript, and Tailwind CSS
- Inspired by modern HR platforms
- Natural, calming design for better UX

##  Support

For questions or support, please open an issue on GitHub.

---

**Built for TalentFlow Assignment** | A complete hiring management solution with local persistence and beautiful UI.
