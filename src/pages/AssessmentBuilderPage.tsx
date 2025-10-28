import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { Assessment, AssessmentSection, AssessmentQuestion } from '../types';
import { db } from '../db';
import { useAssessmentStore } from '../store';
import toast from 'react-hot-toast';

const AssessmentBuilderPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { assessments, addAssessment, updateAssessment } = useAssessmentStore();
  
  const [assessment, setAssessment] = useState<Assessment>({
    id: '',
    jobId: jobId || '',
    title: '',
    description: '',
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    fetchAssessment();
  }, [jobId]);

  const fetchAssessment = async () => {
    if (!jobId) return;
    
    try {
      const existing = await db.assessments.where('jobId').equals(jobId).first();
      if (existing) {
        setAssessment(existing);
      } else {
        // Get job title for default assessment name
        const job = await db.jobs.get(jobId);
        setAssessment(prev => ({
          ...prev,
          jobId,
          title: job ? `${job.title} Assessment` : 'New Assessment'
        }));
      }
    } catch (error) {
      toast.error('Failed to load assessment');
    }
  };

  const handleSave = async () => {
    try {
      const updatedAssessment = {
        ...assessment,
        updatedAt: new Date().toISOString()
      };

      if (assessment.id) {
        await db.assessments.update(assessment.id, updatedAssessment as any);
        updateAssessment(assessment.id, updatedAssessment);
      } else {
        updatedAssessment.id = crypto.randomUUID();
        updatedAssessment.createdAt = new Date().toISOString();
        await db.assessments.add(updatedAssessment);
        addAssessment(updatedAssessment);
        setAssessment(updatedAssessment);
      }

      toast.success('Assessment saved successfully');
    } catch (error) {
      toast.error('Failed to save assessment');
    }
  };

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: crypto.randomUUID(),
      title: 'New Section',
      description: '',
      questions: [],
      order: assessment.sections.length + 1
    };
    
    setAssessment(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    
    setSelectedSectionIndex(assessment.sections.length);
  };

  const deleteSection = (sectionIndex: number) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.filter((_, index) => index !== sectionIndex)
    }));
    
    if (selectedSectionIndex === sectionIndex) {
      setSelectedSectionIndex(null);
    }
  };

  const updateSection = (sectionIndex: number, updates: Partial<AssessmentSection>) => {
    setAssessment(prev => ({
      ...prev,
      sections: prev.sections.map((section, index) =>
        index === sectionIndex ? { ...section, ...updates } : section
      )
    }));
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: AssessmentQuestion = {
      id: crypto.randomUUID(),
      type: 'short-text',
      title: 'New Question',
      description: '',
      required: true,
      order: assessment.sections[sectionIndex].questions.length + 1
    };
    
    updateSection(sectionIndex, {
      questions: [...assessment.sections[sectionIndex].questions, newQuestion]
    });
  };

  const deleteQuestion = (sectionIndex: number, questionIndex: number) => {
    const section = assessment.sections[sectionIndex];
    updateSection(sectionIndex, {
      questions: section.questions.filter((_, index) => index !== questionIndex)
    });
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<AssessmentQuestion>) => {
    const section = assessment.sections[sectionIndex];
    const question = section.questions[questionIndex];
    
    updateSection(sectionIndex, {
      questions: section.questions.map((q, index) =>
        index === questionIndex ? { ...question, ...updates } : q
      )
    });
  };

  // Render preview of questions
  const renderQuestionPreview = (question: AssessmentQuestion) => {
    const id = `preview-${question.id}`;
    
    return (
      <div key={question.id} className="mb-6 p-4 border border-stone-200 rounded-lg bg-white">
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {question.title}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {question.description && (
          <p className="text-xs text-stone-500 mb-3">{question.description}</p>
        )}
        
        {question.type === 'single-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input type="radio" name={id} value={option} className="mr-2" disabled />
                <span className="text-sm text-stone-600">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {question.type === 'multi-choice' && (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center">
                <input type="checkbox" name={id} value={option} className="mr-2" disabled />
                <span className="text-sm text-stone-600">{option}</span>
              </label>
            ))}
          </div>
        )}
        
        {(question.type === 'short-text' || question.type === 'long-text') && (
          <textarea
            rows={question.type === 'long-text' ? 4 : 1}
            className="input-field resize-none"
            placeholder="Type your answer..."
            disabled
          />
        )}
        
        {question.type === 'numeric' && (
          <input
            type="number"
            min={question.min}
            max={question.max}
            className="input-field"
            placeholder="Enter a number"
            disabled
          />
        )}
        
        {question.type === 'file-upload' && (
          <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
            <p className="text-sm text-stone-500">File Upload</p>
          </div>
        )}
      </div>
    );
  };

  const selectedSection = selectedSectionIndex !== null ? assessment.sections[selectedSectionIndex] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/assessments')}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{assessment.title}</h1>
            <p className="text-stone-600">Assessment Builder</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary"
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Save Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder Side */}
        <div className="space-y-6">
          {/* Assessment Info */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Assessment Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={assessment.title}
                  onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                  className="input-field"
                  placeholder="Assessment Title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Description
                </label>
                <textarea
                  value={assessment.description}
                  onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Describe the assessment..."
                />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-900">Sections</h2>
              <button
                onClick={addSection}
                className="btn-secondary text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Section
              </button>
            </div>
            
            <div className="space-y-4">
              {assessment.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className={`border-2 rounded-lg p-4 ${
                    selectedSectionIndex === sectionIndex
                      ? 'border-sage-500 bg-sage-50'
                      : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-stone-900">{section.title}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedSectionIndex(
                          selectedSectionIndex === sectionIndex ? null : sectionIndex
                        )}
                        className="btn-ghost text-sm"
                      >
                        {selectedSectionIndex === sectionIndex ? 'Collapse' : 'Expand'}
                      </button>
                      <button
                        onClick={() => deleteSection(sectionIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {selectedSectionIndex === sectionIndex && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Section Title
                        </label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={section.description}
                          onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                          className="input-field resize-none"
                          rows={2}
                        />
                      </div>
                      
                      <div className="pt-4 border-t border-stone-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-stone-700">Questions</span>
                          <button
                            onClick={() => addQuestion(sectionIndex)}
                            className="btn-secondary text-sm"
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Add Question
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          {section.questions.map((question, questionIndex) => (
                            <div
                              key={question.id}
                              className="p-3 bg-stone-50 rounded-lg border border-stone-200"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <select
                                  value={question.type}
                                  onChange={(e) => updateQuestion(
                                    sectionIndex, 
                                    questionIndex, 
                                    { type: e.target.value as AssessmentQuestion['type'] }
                                  )}
                                  className="input-field text-sm py-1"
                                >
                                  <option value="short-text">Short Text</option>
                                  <option value="long-text">Long Text</option>
                                  <option value="single-choice">Single Choice</option>
                                  <option value="multi-choice">Multi Choice</option>
                                  <option value="numeric">Numeric</option>
                                  <option value="file-upload">File Upload</option>
                                </select>
                                <button
                                  onClick={() => deleteQuestion(sectionIndex, questionIndex)}
                                  className="text-red-600 hover:text-red-700 ml-2"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <input
                                type="text"
                                value={question.title}
                                onChange={(e) => updateQuestion(
                                  sectionIndex,
                                  questionIndex,
                                  { title: e.target.value }
                                )}
                                className="input-field text-sm mb-2"
                                placeholder="Question text"
                              />
                              
                              {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                                <div className="space-y-2 mb-2">
                                  {question.options?.map((option, idx) => (
                                    <input
                                      key={idx}
                                      type="text"
                                      value={option}
                                      onChange={(e) => {
                                        const newOptions = [...(question.options || [])];
                                        newOptions[idx] = e.target.value;
                                        updateQuestion(sectionIndex, questionIndex, { options: newOptions });
                                      }}
                                      className="input-field text-sm"
                                      placeholder={`Option ${idx + 1}`}
                                    />
                                  ))}
                                  <button
                                    onClick={() => {
                                      const newOptions = [...(question.options || []), ''];
                                      updateQuestion(sectionIndex, questionIndex, { options: newOptions });
                                    }}
                                    className="text-sage-600 hover:text-sage-700 text-sm"
                                  >
                                    + Add Option
                                  </button>
                                </div>
                              )}
                              
                              <div className="space-y-2">
                                <label className="flex items-center text-sm text-stone-600">
                                  <input
                                    type="checkbox"
                                    checked={question.required}
                                    onChange={(e) => updateQuestion(
                                      sectionIndex,
                                      questionIndex,
                                      { required: e.target.checked }
                                    )}
                                    className="mr-2"
                                  />
                                  Required
                                </label>
                                
                                {/* Conditional Logic */}
                                {assessment.sections[sectionIndex].questions.length > 1 && (
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-sage-600 hover:text-sage-700">
                                      Add Conditional Logic
                                    </summary>
                                    <div className="mt-2 p-3 bg-stone-50 rounded border border-stone-200">
                                      <label className="block text-xs font-medium text-stone-700 mb-1">
                                        Show this question if:
                                      </label>
                                      <select
                                        value={question.conditionalLogic?.dependsOn || ''}
                                        onChange={(e) => {
                                          const dependentQuestion = section.questions.find(q => q.id === e.target.value);
                                          if (dependentQuestion) {
                                            updateQuestion(sectionIndex, questionIndex, {
                                              conditionalLogic: {
                                                dependsOn: e.target.value,
                                                condition: question.conditionalLogic?.condition || 'equals',
                                                value: question.conditionalLogic?.value || ''
                                              }
                                            });
                                          }
                                        }}
                                        className="input-field text-xs mb-2"
                                      >
                                        <option value="">Select question</option>
                                        {section.questions
                                          .filter((_, idx) => idx !== questionIndex)
                                          .map((q, idx) => (
                                            <option key={q.id} value={q.id}>
                                              {q.title}
                                            </option>
                                          ))}
                                      </select>
                                      
                                      {question.conditionalLogic?.dependsOn && (
                                        <>
                                          <select
                                            value={question.conditionalLogic.condition}
                                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                              conditionalLogic: {
                                                ...question.conditionalLogic!,
                                                condition: e.target.value as any
                                              }
                                            })}
                                            className="input-field text-xs mb-2"
                                          >
                                            <option value="equals">equals</option>
                                            <option value="not-equals">not equals</option>
                                            <option value="contains">contains</option>
                                          </select>
                                          
                                          <input
                                            type="text"
                                            value={question.conditionalLogic.value}
                                            onChange={(e) => updateQuestion(sectionIndex, questionIndex, {
                                              conditionalLogic: {
                                                ...question.conditionalLogic!,
                                                value: e.target.value
                                              }
                                            })}
                                            className="input-field text-xs"
                                            placeholder="Value"
                                          />
                                        </>
                                      )}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {section.questions.length === 0 && (
                            <p className="text-sm text-stone-400 text-center py-4">
                              No questions yet. Click "Add Question" to get started.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {assessment.sections.length === 0 && (
                <p className="text-center text-stone-400 py-8">
                  No sections yet. Click "Add Section" to get started.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Preview Side */}
        {showPreview && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Live Preview</h2>
            <div className="space-y-4">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-stone-900 mb-2">{assessment.title}</h3>
                {assessment.description && (
                  <p className="text-stone-600">{assessment.description}</p>
                )}
              </div>
              
              {assessment.sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h4 className="text-lg font-semibold text-stone-900 mb-2">{section.title}</h4>
                  {section.description && (
                    <p className="text-sm text-stone-600 mb-4">{section.description}</p>
                  )}
                  
                  {section.questions.map(question => renderQuestionPreview(question))}
                </div>
              ))}
              
              {assessment.sections.length === 0 && (
                <div className="text-center py-12 text-stone-400">
                  <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Add sections to see the preview</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentBuilderPage;