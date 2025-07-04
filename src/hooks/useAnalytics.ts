import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  trackButtonClick,
  trackNavigation,
  trackToolUsage,
  trackFileUpload,
  trackDownload,
  trackEngagement,
  trackError,
  initializeAnalytics,
} from '../utils/analytics';

// Hook for analytics tracking in React components
export const useAnalytics = () => {
  const location = useLocation();
  const previousLocationRef = useRef<string>('');

  // Track page views on route changes
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    const previousPath = previousLocationRef.current;
    
    // Track page view
    trackPageView(window.location.href, document.title);
    
    // Track navigation if there was a previous page
    if (previousPath && previousPath !== currentPath) {
      trackNavigation(previousPath, currentPath);
    }
    
    // Update previous location
    previousLocationRef.current = currentPath;
  }, [location]);

  // Initialize analytics on first mount
  useEffect(() => {
    initializeAnalytics();
  }, []);

  // Return tracking functions for component use
  return {
    trackButtonClick,
    trackToolUsage,
    trackFileUpload,
    trackDownload,
    trackEngagement,
    trackError,
    
    // Convenience functions with current location context
    trackCurrentPageButtonClick: (buttonName: string, additionalData?: Record<string, any>) => {
      trackButtonClick(buttonName, location.pathname, additionalData);
    },
    
    trackCurrentPageToolUsage: (toolName: string, action: string, additionalData?: Record<string, any>) => {
      trackToolUsage(toolName, action, { page: location.pathname, ...additionalData });
    },
    
    trackCurrentPageEngagement: (action: string, value?: number, additionalData?: Record<string, any>) => {
      trackEngagement(action, value, { page: location.pathname, ...additionalData });
    },
    
    trackCurrentPageError: (errorType: string, errorMessage: string) => {
      trackError(errorType, errorMessage, location.pathname);
    },
  };
};

// Hook specifically for tool pages
export const useToolAnalytics = (toolName: string) => {
  const analytics = useAnalytics();
  
  return {
    ...analytics,
    
    // Tool-specific tracking functions
    trackToolStart: (additionalData?: Record<string, any>) => {
      analytics.trackCurrentPageToolUsage(toolName, 'tool_started', additionalData);
    },
    
    trackToolComplete: (outputType?: string, additionalData?: Record<string, any>) => {
      analytics.trackCurrentPageToolUsage(toolName, 'tool_completed', {
        output_type: outputType,
        ...additionalData,
      });
    },
    
    trackFileUpload: (fileType: string, fileSize?: number) => {
      analytics.trackFileUpload(toolName, fileType, fileSize);
    },
    
    trackDownload: (outputType: string, additionalData?: Record<string, any>) => {
      analytics.trackDownload(toolName, outputType, additionalData);
    },
    
    trackToolError: (errorMessage: string, errorType = 'tool_error') => {
      analytics.trackCurrentPageError(errorType, `${toolName}: ${errorMessage}`);
    },
    
    trackToolFeatureUse: (featureName: string, additionalData?: Record<string, any>) => {
      analytics.trackCurrentPageToolUsage(toolName, `feature_${featureName}`, additionalData);
    },
  };
}; 