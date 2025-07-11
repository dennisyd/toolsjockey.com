import React, { useState } from 'react';
import FileUploader from '../../components/shared/FileUploader';
import { useAnalytics } from '../../hooks/useAnalytics';

interface EmailValidationResult {
  email: string;
  status: 'Valid' | 'Invalid' | 'Disposable' | 'Suspicious';
  message: string;
}

const EmailValidatorPage: React.FC = () => {
  const { trackButtonClick, trackToolUsage } = useAnalytics();
  const [singleEmail, setSingleEmail] = useState('');
  const [singleResult, setSingleResult] = useState<EmailValidationResult | null>(null);
  const [bulkResults, setBulkResults] = useState<EmailValidationResult[]>([]);
  const [validationMode, setValidationMode] = useState<'single' | 'bulk'>('single');

  // Disposable email domains list
  const disposableDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
    'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'guerrillamailblock.com',
    'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com',
    'fakeinbox.com', 'getairmail.com', 'mailnesia.com', 'maildrop.cc', 'yopmail.com',
    'trashmail.com', 'spammotel.com', 'spamspot.com', 'spam.la', 'jetable.org',
    'mailmetrash.com', 'tempr.email', 'tmpeml.com', 'tmpmail.org', 'tmpmail.net',
    'tmpeml.com', '10minutemail.net', '10minutemail.org', '10minutemail.info'
  ];

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = (email: string): EmailValidationResult => {
    const trimmedEmail = email.trim().toLowerCase();
    
    // Check if empty
    if (!trimmedEmail) {
      return {
        email: email,
        status: 'Invalid',
        message: 'Email address is empty'
      };
    }

    // Check format
    if (!emailRegex.test(trimmedEmail)) {
      return {
        email: email,
        status: 'Invalid',
        message: 'Invalid email format'
      };
    }

    // Check for disposable domains
    const domain = trimmedEmail.split('@')[1];
    if (disposableDomains.includes(domain)) {
      return {
        email: email,
        status: 'Disposable',
        message: 'Disposable email domain detected'
      };
    }

    // Check for suspicious patterns
    if (trimmedEmail.includes('test') || trimmedEmail.includes('example') || 
        trimmedEmail.includes('temp') || trimmedEmail.includes('fake')) {
      return {
        email: email,
        status: 'Suspicious',
        message: 'Suspicious email pattern detected'
      };
    }

    return {
      email: email,
      status: 'Valid',
      message: 'Email address is valid'
    };
  };

  const handleSingleEmailValidation = () => {
    trackButtonClick('email_validator_single_validate', 'EmailValidator');
    
    if (!singleEmail.trim()) {
      setSingleResult({
        email: singleEmail,
        status: 'Invalid',
        message: 'Please enter an email address'
      });
      return;
    }

    const result = validateEmail(singleEmail);
    setSingleResult(result);
    
    trackToolUsage('email_validator', 'single_validation', {
      email_count: 1,
      result_status: result.status
    });
  };

  const handleBulkValidation = async (file: File) => {
    trackButtonClick('email_validator_bulk_validate', 'EmailValidator');
    trackToolUsage('email_validator', 'bulk_validation_start', {
      file_size: file.size,
      file_type: file.type
    });
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const results: EmailValidationResult[] = [];

      for (const line of lines) {
        const email = line.trim();
        if (email) {
          results.push(validateEmail(email));
        }
      }

      setBulkResults(results);
      
      trackToolUsage('email_validator', 'bulk_validation_complete', {
        email_count: results.length,
        valid_count: results.filter(r => r.status === 'Valid').length,
        invalid_count: results.filter(r => r.status === 'Invalid').length,
        disposable_count: results.filter(r => r.status === 'Disposable').length,
        suspicious_count: results.filter(r => r.status === 'Suspicious').length
      });
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please ensure it\'s a valid CSV file.');
      trackToolUsage('email_validator', 'bulk_validation_error', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const exportResults = () => {
    if (bulkResults.length === 0) return;

    trackButtonClick('email_validator_export_results', 'EmailValidator');
    trackToolUsage('email_validator', 'export_results', {
      result_count: bulkResults.length
    });

    const csvContent = [
      'Email,Status,Message',
      ...bulkResults.map(result => 
        `"${result.email}","${result.status}","${result.message}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-validation-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Valid': return 'text-green-600 bg-green-100';
      case 'Invalid': return 'text-red-600 bg-red-100';
      case 'Disposable': return 'text-orange-600 bg-orange-100';
      case 'Suspicious': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Valid': return '✅';
      case 'Invalid': return '❌';
      case 'Disposable': return '⚠️';
      case 'Suspicious': return '🔍';
      default: return '❓';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Email Validator</h1>
          <p className="text-xl text-gray-600">
            Validate single emails or bulk validate via CSV upload. Check format, disposable domains, and export results.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setValidationMode('single')}
              className={`px-4 py-2 rounded-md transition-colors ${
                validationMode === 'single'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Single Email
            </button>
            <button
              onClick={() => setValidationMode('bulk')}
              className={`px-4 py-2 rounded-md transition-colors ${
                validationMode === 'bulk'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bulk Validation
            </button>
          </div>
        </div>

        {validationMode === 'single' ? (
          /* Single Email Validation */
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Single Email Validation</h2>
            <div className="flex gap-4 mb-6">
              <input
                type="email"
                value={singleEmail}
                onChange={(e) => setSingleEmail(e.target.value)}
                placeholder="Enter email address..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSingleEmailValidation()}
              />
              <button
                onClick={handleSingleEmailValidation}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Validate
              </button>
            </div>

            {singleResult && (
              <div className="mt-6 p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getStatusIcon(singleResult.status)}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(singleResult.status)}`}>
                    {singleResult.status}
                  </span>
                </div>
                <p className="text-gray-700">{singleResult.message}</p>
                <p className="text-sm text-gray-500 mt-2">Email: {singleResult.email}</p>
              </div>
            )}
          </div>
        ) : (
          /* Bulk Email Validation */
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Bulk Email Validation</h2>
            <p className="text-gray-600 mb-6">
              Upload a CSV file with email addresses (one per line) to validate multiple emails at once.
            </p>

            <FileUploader
              onFileUpload={(files: File[]) => {
                if (files.length > 0) {
                  handleBulkValidation(files[0]);
                }
              }}
              accept=".csv,.txt"
              maxSize={5 * 1024 * 1024} // 5MB
              description="Upload CSV file with email addresses"
            />

            {bulkResults.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Validation Results</h3>
                  <button
                    onClick={exportResults}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkResults.map((result, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{result.email}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{result.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {bulkResults.filter(r => r.status === 'Valid').length}
                    </div>
                    <div className="text-sm text-green-600">Valid</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {bulkResults.filter(r => r.status === 'Invalid').length}
                    </div>
                    <div className="text-sm text-red-600">Invalid</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {bulkResults.filter(r => r.status === 'Disposable').length}
                    </div>
                    <div className="text-sm text-orange-600">Disposable</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {bulkResults.filter(r => r.status === 'Suspicious').length}
                    </div>
                    <div className="text-sm text-yellow-600">Suspicious</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Format Validation</h3>
            <p className="text-blue-700">Checks email format using regex patterns to ensure valid structure.</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Disposable Detection</h3>
            <p className="text-green-700">Identifies emails from disposable/temporary email services.</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">Bulk Processing</h3>
            <p className="text-purple-700">Upload CSV files to validate multiple emails at once.</p>
          </div>
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">Export Results</h3>
            <p className="text-orange-700">Download validation results as CSV for further analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailValidatorPage; 