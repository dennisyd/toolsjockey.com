import React from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';

interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackingName: string;
  trackingCategory?: string;
  additionalData?: Record<string, any>;
  children: React.ReactNode;
}

// Button component that automatically tracks clicks
export const TrackedButton: React.FC<TrackedButtonProps> = ({
  trackingName,
  trackingCategory = 'button',
  additionalData = {},
  onClick,
  children,
  ...props
}) => {
  const { trackCurrentPageButtonClick } = useAnalytics();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Track the button click
    trackCurrentPageButtonClick(trackingName, {
      category: trackingCategory,
      ...additionalData,
    });

    // Call the original onClick handler if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  );
};

// HOC to wrap any button with tracking
export const withButtonTracking = <P extends object>(
  Component: React.ComponentType<P>,
  trackingName: string,
  trackingCategory = 'button'
) => {
  return React.forwardRef<any, P & { additionalTrackingData?: Record<string, any> }>((props, ref) => {
    const { additionalTrackingData, ...componentProps } = props;
    const { trackCurrentPageButtonClick } = useAnalytics();

    const handleClick = (originalOnClick?: (...args: any[]) => void) => {
      return (...args: any[]) => {
        trackCurrentPageButtonClick(trackingName, {
          category: trackingCategory,
          ...additionalTrackingData,
        });
        if (originalOnClick) {
          originalOnClick(...args);
        }
      };
    };

    // If the component has an onClick prop, wrap it with tracking
    const enhancedProps = {
      ...componentProps,
      onClick: (componentProps as any).onClick ? handleClick((componentProps as any).onClick) : handleClick(),
    };

    return <Component ref={ref} {...(enhancedProps as P)} />;
  });
};

export default TrackedButton; 