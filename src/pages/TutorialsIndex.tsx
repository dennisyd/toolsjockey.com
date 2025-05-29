import React from 'react';
import { Link } from 'react-router-dom';
import { tutorialsConfig } from '../data/tutorialsConfig';

const TutorialsIndex: React.FC = () => (
  <div className="container-app max-w-5xl mx-auto px-2 sm:px-4 py-10 sm:py-16">
    <h1 className="text-4xl font-bold mb-6 text-center text-slate-900 dark:text-white">Tutorials</h1>
    <p className="mb-8 text-center text-slate-600 dark:text-slate-300 max-w-xl mx-auto text-base sm:text-lg">
      Step-by-step guides to help you get the most out of every tool on ToolsJockey.com.
    </p>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tutorialsConfig.map(tutorial => (
        <div key={tutorial.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-md ring-1 ring-slate-100 dark:ring-slate-800 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-accent">{tutorial.title}</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-3 text-sm">{tutorial.steps[0]?.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {tutorial.tags?.map(tag => (
                <span key={tag} className="bg-accent/10 text-accent px-2 py-0.5 rounded text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
          <Link to={`/tutorials/${tutorial.id}`} className="btn btn-primary w-full mt-auto">View Tutorial</Link>
        </div>
      ))}
    </div>
    <div className="mt-10 text-center">
      <Link to="/" className="text-accent underline">&larr; Back to Home</Link>
    </div>
  </div>
);

export default TutorialsIndex; 