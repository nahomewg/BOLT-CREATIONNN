export const initializeMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Report Web Vitals
    const reportWebVitals = (metric) => {
      console.log(metric);
      // Send to your analytics service
    };

    // Initialize Performance Observer
    const perfObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log performance metrics
        console.log(`${entry.name}: ${entry.duration}`);
      });
    });

    perfObserver.observe({ entryTypes: ['resource', 'navigation', 'longtask'] });

    return reportWebVitals;
  }
}; 