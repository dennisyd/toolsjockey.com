import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { tutorialsConfig } from '../data/tutorialsConfig';
import { useAnalytics } from '../hooks/useAnalytics';

const TutorialPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const { id } = useParams<{ id: string }>();
  const tutorial = tutorialsConfig.find(t => t.id === id);

  if (!tutorial) {
    return (
      <div className="container-app max-w-2xl mx-auto px-2 sm:px-4 py-10 sm:py-16 text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-600">Tutorial Not Found</h1>
        <p className="mb-6">Sorry, we couldn't find that tutorial.</p>
        <Link to="/tutorials" className="text-accent underline">&larr; Back to Tutorials</Link>
      </div>
    );
  }

  return (
    <div className="container-app max-w-4xl mx-auto px-4 py-8">
      <Link 
        to="/tutorials" 
        className="btn btn-secondary mb-4"
        onClick={() => trackButtonClick('tutorial_back_to_index', 'TutorialPage')}
      >
        ← Back to Tutorials
      </Link>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-100 dark:ring-slate-800 p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-accent text-center">{tutorial.title}</h1>
        <ol className="space-y-8">
          {tutorial.steps.map((step, idx) => (
            <li key={idx} className="flex flex-col sm:flex-row gap-6 items-start">
              {step.image && (
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full sm:w-48 h-auto rounded-lg shadow border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
                  loading="lazy"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold mb-2">Step {idx + 1}: {step.title}</h2>
                <p className="text-slate-700 dark:text-slate-200 text-base">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        {tutorial.note && (
          <div className="mt-6">{tutorial.note}</div>
        )}
        <div className="mt-10 text-center">
          <Link to="/tutorials" className="text-accent underline">&larr; Back to Tutorials</Link>
        </div>
      </div>
      
      <Link 
        to={`/tools/${id}`} 
        className="btn btn-primary"
        onClick={() => trackButtonClick(`tutorial_try_${id}`, 'TutorialPage')}
      >
        Try This Tool
      </Link>
    </div>
  );
};

export default TutorialPage; 