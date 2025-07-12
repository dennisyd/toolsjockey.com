// Analytics utility for Google Analytics 4 tracking
// Designed to support AdSense qualification with comprehensive user interaction tracking

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Analytics configuration
export const GA_TRACKING_ID = 'G-Y0EMW97EXD';

// Track page views - essential for AdSense
export const trackPageView = (url: string, title?: string) => {
  if (!isGtagAvailable()) return;
  
  window.gtag('config', GA_TRACKING_ID, {
    page_location: url,
    page_title: title || document.title,
  });
  
  // Also send as an event for better tracking
  window.gtag('event', 'page_view', {
    page_location: url,
    page_title: title || document.title,
  });
};

// Track custom events - crucial for showing user engagement
export const trackEvent = (eventName: string, parameters: Record<string, any> = {}) => {
  if (!isGtagAvailable()) {
    console.log('Analytics: gtag not available');
    return;
  }
  
  console.log('Analytics: Tracking event', eventName, parameters);
  
  window.gtag('event', eventName, {
    ...parameters,
    timestamp: new Date().toISOString(),
  });
};

// Track button clicks - important for user interaction signals
export const trackButtonClick = (buttonName: string, location: string, additionalData: Record<string, any> = {}) => {
  trackEvent('button_click', {
    button_name: buttonName,
    click_location: location,
    event_category: 'engagement',
    event_label: `${location} - ${buttonName}`,
    ...additionalData,
  });
};

// Track navigation - shows user journey through site
export const trackNavigation = (from: string, to: string, linkText?: string) => {
  trackEvent('navigation_click', {
    from_page: from,
    to_page: to,
    link_text: linkText,
    event_category: 'navigation',
    event_label: `${from} → ${to}`,
  });
};

// Track tool usage - demonstrates actual value delivery
export const trackToolUsage = (toolName: string, action: string, additionalData: Record<string, any> = {}) => {
  trackEvent('tool_usage', {
    tool_name: toolName,
    tool_action: action,
    event_category: 'tools',
    event_label: `${toolName} - ${action}`,
    ...additionalData,
  });
};

// Track file uploads - shows active tool usage
export const trackFileUpload = (toolName: string, fileType: string, fileSize?: number) => {
  trackEvent('file_upload', {
    tool_name: toolName,
    file_type: fileType,
    file_size: fileSize,
    event_category: 'tools',
    event_label: `${toolName} - Upload ${fileType}`,
  });
};

// Track downloads - shows successful tool completion
export const trackDownload = (toolName: string, outputType: string, additionalData: Record<string, any> = {}) => {
  trackEvent('file_download', {
    tool_name: toolName,
    output_type: outputType,
    event_category: 'conversion',
    event_label: `${toolName} - Download ${outputType}`,
    ...additionalData,
  });
};

// Track external link clicks - important for understanding user flow
export const trackExternalLink = (url: string, linkText?: string, location?: string) => {
  trackEvent('external_link_click', {
    link_url: url,
    link_text: linkText,
    click_location: location,
    event_category: 'external_links',
    event_label: `External: ${url}`,
  });
};

// Track search queries (if you have search functionality)
export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
    event_category: 'search',
    event_label: searchTerm,
  });
};

// Track user engagement metrics - crucial for AdSense
export const trackEngagement = (action: string, value?: number, additionalData: Record<string, any> = {}) => {
  trackEvent('user_engagement', {
    engagement_action: action,
    engagement_value: value,
    event_category: 'engagement',
    event_label: action,
    ...additionalData,
  });
};

// Track scroll depth - shows content engagement
export const trackScrollDepth = (percentage: number, page: string) => {
  trackEvent('scroll_depth', {
    scroll_percentage: percentage,
    page_path: page,
    event_category: 'engagement',
    event_label: `${page} - ${percentage}%`,
  });
};

// Track time on page - demonstrates user interest
export const trackTimeOnPage = (timeSpent: number, page: string) => {
  trackEvent('time_on_page', {
    time_spent_seconds: timeSpent,
    page_path: page,
    event_category: 'engagement',
    event_label: `${page} - ${timeSpent}s`,
  });
};

// Track errors - helps with site improvement
export const trackError = (errorType: string, errorMessage: string, location: string) => {
  trackEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    error_location: location,
    event_category: 'errors',
    event_label: `${location} - ${errorType}`,
  });
};

// Initialize enhanced analytics tracking
export const initializeAnalytics = () => {
  if (!isGtagAvailable()) {
    return;
  }

  // Track initial page load
  trackPageView(window.location.href);
  
  // Set up scroll depth tracking
  let maxScrollDepth = 0;
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollDepth = Math.round((scrollTop / documentHeight) * 100);
    
    // Track at 25%, 50%, 75%, and 100% intervals
    if (scrollDepth > maxScrollDepth) {
      const milestones = [25, 50, 75, 100];
      const milestone = milestones.find(m => scrollDepth >= m && maxScrollDepth < m);
      if (milestone) {
        trackScrollDepth(milestone, window.location.pathname);
        maxScrollDepth = milestone;
      }
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Track time on page when user leaves
  let startTime = Date.now();
  const trackTimeOnPageEvent = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    if (timeSpent > 5) { // Only track if user spent more than 5 seconds
      trackTimeOnPage(timeSpent, window.location.pathname);
    }
  };
  
  window.addEventListener('beforeunload', trackTimeOnPageEvent);
  window.addEventListener('pagehide', trackTimeOnPageEvent);
  
  // Track clicks on external links
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.href) {
      const isExternal = !link.href.includes(window.location.hostname);
      if (isExternal) {
        trackExternalLink(link.href, link.textContent || '', window.location.pathname);
      }
    }
  });
};

// Debug function to test analytics
export const testAnalytics = () => {
  trackEvent('analytics_test', {
    test_timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent,
    page_url: window.location.href,
  });
}; 