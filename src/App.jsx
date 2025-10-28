import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { worker } from './mocks/handlers';
import { initializeDB } from './db';
import Layout from './components/Layout';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import AssessmentsPage from './pages/AssessmentsPage';
import AssessmentBuilderPage from './pages/AssessmentBuilderPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  useEffect(() => {
    initializeDB();
    if (process.env.NODE_ENV === 'development') {
      worker.start({ onUnhandledRequest: 'bypass' });
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-natural">
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:id" element={<CandidateDetailPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/assessments/:jobId" element={<AssessmentBuilderPage />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              boxShadow:
                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;


