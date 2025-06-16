import React from 'react';
import type { OutputFormat } from '../../../types/video';
import { VIDEO_FORMATS } from '../../../types/video';

interface FormatSelectorProps {
  selectedFormat: OutputFormat;
  onChange: (format: OutputFormat) => void;
  disabled: boolean;
}

const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormat,
  onChange,
  disabled,
}) => {
  const formatOptions = Object.entries(VIDEO_FORMATS);

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Output Format
      </label>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {formatOptions.map(([format, info]) => (
          <div key={format} className="relative">
            <input
              type="radio"
              name="format"
              id={`format-${format}`}
              value={format}
              checked={selectedFormat === format}
              onChange={() => onChange(format as OutputFormat)}
              className="sr-only peer"
              disabled={disabled}
            />
            <label
              htmlFor={`format-${format}`}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors
                text-gray-800 dark:text-gray-200
                peer-checked:text-blue-600 peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20
                ${
                  disabled
                    ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70'
                    : 'bg-white dark:bg-primary-light hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                }
              `}
            >
              <div className="w-full text-center">
                <span className="text-2xl font-semibold block">{info.name}</span>
                <span className="text-xs block mt-1 text-gray-500 dark:text-gray-400">
                  .{info.extension}
                </span>
                <span className="text-xs mt-2 block text-gray-500 dark:text-gray-400">
                  {info.description}
                </span>
              </div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormatSelector; 