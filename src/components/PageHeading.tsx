import React from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

const PageHeading: React.FC<PageHeadingProps> = ({ 
  title, 
  subtitle, 
  className = '' 
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
      )}
    </div>
  );
};

export default PageHeading; 