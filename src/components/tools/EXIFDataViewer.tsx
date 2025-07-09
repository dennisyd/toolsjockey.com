import React, { useState, useCallback } from 'react';
import { EyeIcon, ExclamationTriangleIcon, ShieldCheckIcon, MapPinIcon, CameraIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../layout/ToolPageLayout';

interface EXIFData {
  [key: string]: any;
}

interface LocationData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  timestamp?: string;
}

const EXIFDataViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exifData, setExifData] = useState<EXIFData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load EXIF.js library dynamically
  const loadEXIF = async () => {
    if (typeof window !== 'undefined' && !(window as any).EXIF) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/exif-js@2.3.0/exif.min.js';
      script.async = true;
      
      return new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load EXIF library'));
        document.head.appendChild(script);
      });
    }
  };

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setExifData(null);
    setLocationData(null);
    setImagePreview(null);

    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process EXIF data
    setIsProcessing(true);
    try {
      await loadEXIF();
      
      const EXIF = (window as any).EXIF;
      if (!EXIF) {
        throw new Error('EXIF library not available');
      }

      EXIF.getData(file, function(this: any) {
        const data = EXIF.getAllTags(this);
        if (data && Object.keys(data).length > 0) {
          setExifData(data);
          
          // Extract location data
          const gps = EXIF.getTag(this, 'GPSLatitude');
          if (gps) {
            const lat = EXIF.getTag(this, 'GPSLatitude');
            const lon = EXIF.getTag(this, 'GPSLongitude');
            const alt = EXIF.getTag(this, 'GPSAltitude');
            const timestamp = EXIF.getTag(this, 'GPSTimeStamp');
            
            if (lat && lon) {
              setLocationData({
                latitude: convertDMSToDD(lat, EXIF.getTag(this, 'GPSLatitudeRef')),
                longitude: convertDMSToDD(lon, EXIF.getTag(this, 'GPSLongitudeRef')),
                altitude: alt ? parseFloat(alt) : undefined,
                timestamp: timestamp ? formatGPSTime(timestamp) : undefined
              });
            }
          }
        } else {
          setError('No EXIF data found in this image');
        }
        setIsProcessing(false);
      });
    } catch (err) {
      setError('Failed to process EXIF data. Please try again.');
      console.error('EXIF processing error:', err);
      setIsProcessing(false);
    }
  }, []);

  // Convert DMS (Degrees, Minutes, Seconds) to Decimal Degrees
  const convertDMSToDD = (dms: number[], ref: string): number => {
    const degrees = dms[0];
    const minutes = dms[1];
    const seconds = dms[2];
    
    let dd = degrees + minutes / 60 + seconds / 3600;
    
    if (ref === 'S' || ref === 'W') {
      dd = -dd;
    }
    
    return dd;
  };

  // Format GPS timestamp
  const formatGPSTime = (timestamp: number[]): string => {
    const hours = timestamp[0];
    const minutes = timestamp[1];
    const seconds = timestamp[2];
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Group EXIF data by category
  const groupEXIFData = (data: EXIFData) => {
    const groups: { [key: string]: { [key: string]: any } } = {
      'Camera Information': {},
      'Image Settings': {},
      'Date & Time': {},
      'Location Data': {},
      'Technical Details': {},
      'Other': {}
    };

    const cameraInfo = ['Make', 'Model', 'Software', 'Artist', 'Copyright'];
    const imageSettings = ['ExposureTime', 'FNumber', 'ISOSpeedRatings', 'FocalLength', 'Flash', 'WhiteBalance'];
    const dateTime = ['DateTime', 'DateTimeOriginal', 'CreateDate', 'ModifyDate'];
    const location = ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSLatitudeRef', 'GPSLongitudeRef'];
    const technical = ['ImageWidth', 'ImageHeight', 'Orientation', 'ColorSpace', 'BitsPerSample'];

    Object.entries(data).forEach(([key, value]) => {
      if (cameraInfo.includes(key)) {
        groups['Camera Information'][key] = value;
      } else if (imageSettings.includes(key)) {
        groups['Image Settings'][key] = value;
      } else if (dateTime.includes(key)) {
        groups['Date & Time'][key] = value;
      } else if (location.includes(key)) {
        groups['Location Data'][key] = value;
      } else if (technical.includes(key)) {
        groups['Technical Details'][key] = value;
      } else {
        groups['Other'][key] = value;
      }
    });

    return groups;
  };

  const formatValue = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    if (typeof value === 'number') {
      if (key.includes('Time') && key !== 'ExposureTime') {
        return new Date(value * 1000).toLocaleString();
      }
      return value.toString();
    }
    
    return String(value);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setExifData(null);
    setLocationData(null);
    setImagePreview(null);
    setError(null);
  };

  return (
    <ToolPageLayout
      toolId="exif-data-viewer"
      title="EXIF Data Viewer"
      icon={EyeIcon}
      group="privacy"
    >
      <div className="max-w-4xl mx-auto">
        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🔒 Client-Side Processing
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your image is processed entirely in your browser. No data is sent to servers.
              </p>
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Image File</h3>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              accept="image/*"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              <div className="text-gray-600 dark:text-gray-300 mb-2">
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      ✓ {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg">Click to select an image</p>
                    <p className="text-sm">or drag and drop</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {imagePreview && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Image Preview</h3>
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-blue-700 dark:text-blue-300">Processing EXIF data...</p>
            </div>
          </div>
        )}

        {/* Location Data */}
        {locationData && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPinIcon className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold">Location Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Latitude</p>
                <p className="font-mono">{locationData.latitude?.toFixed(6)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Longitude</p>
                <p className="font-mono">{locationData.longitude?.toFixed(6)}</p>
              </div>
              {locationData.altitude && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Altitude</p>
                  <p className="font-mono">{locationData.altitude} meters</p>
                </div>
              )}
              {locationData.timestamp && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">GPS Time</p>
                  <p className="font-mono">{locationData.timestamp}</p>
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                ⚠️ This image contains location data. Consider removing EXIF data for privacy.
              </p>
            </div>
          </div>
        )}

        {/* EXIF Data */}
        {exifData && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CameraIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">EXIF Data</h3>
            </div>
            
            {Object.entries(groupEXIFData(exifData)).map(([groupName, groupData]) => {
              if (Object.keys(groupData).length === 0) return null;
              
              return (
                <div key={groupName} className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{groupName}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(groupData).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{key}</p>
                        <p className="font-mono text-sm break-all">{formatValue(key, value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Privacy Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Privacy Notice
              </h3>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                <li>• EXIF data may contain sensitive information like location and timestamps</li>
                <li>• Consider using our EXIF Remover tool to strip metadata before sharing</li>
                <li>• Location data can reveal where photos were taken</li>
                <li>• Camera settings can reveal device information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleClear}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default EXIFDataViewer; 