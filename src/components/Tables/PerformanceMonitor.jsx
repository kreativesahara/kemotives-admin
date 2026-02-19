import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  initPerformanceMonitoring, 
  getPerformanceScore,
  getPerformanceRecommendations,
  onMetricUpdate 
} from '../../utils/performance';

/**
 * Performance Monitoring Component
 * 
 * Automatically tracks Core Web Vitals and other performance metrics.
 * Integrates with Google Analytics and provides actionable insights.
 */
function PerformanceMonitor() {
  const location = useLocation();

  useEffect(() => {
    // Initialize performance monitoring
    const cleanup = initPerformanceMonitoring({
      reportToAnalytics: true,
      logToConsole: process.env.NODE_ENV !== 'production',
      onMetricUpdate: (metric) => {
        // Log poor metrics in development
        if (process.env.NODE_ENV !== 'production' && metric.rating === 'poor') {
          console.warn(`⚠️ Performance Issue: ${metric.name} is ${metric.rating} (${metric.value}ms)`);
        }
      }
    });

    // Monitor LCP specifically
    const lcpUnsubscribe = onMetricUpdate('LCP', ({ value, rating }) => {
      if (rating === 'poor' && process.env.NODE_ENV !== 'production') {
        console.warn('🔴 LCP is poor:', value, 'ms. Target: < 2500ms');
      }
    });

    // Monitor CLS specifically
    const clsUnsubscribe = onMetricUpdate('CLS', ({ value, rating }) => {
      if (rating === 'poor' && process.env.NODE_ENV !== 'production') {
        console.warn('🔴 CLS is poor:', value, '. Target: < 0.1');
      }
    });

    // Monitor INP specifically
    const inpUnsubscribe = onMetricUpdate('INP', ({ value, rating }) => {
      if (rating === 'poor' && process.env.NODE_ENV !== 'production') {
        console.warn('🔴 INP is poor:', value, 'ms. Target: < 200ms');
      }
    });

    // Log performance score on page load
    const logScore = setTimeout(() => {
      const score = getPerformanceScore();
      if (process.env.NODE_ENV !== 'production' && score.overall > 0) {
        console.log('📊 Performance Score:', score.overall, '/ 100');
        
        // Log recommendations if score is low
        if (score.overall < 70) {
          const recommendations = getPerformanceRecommendations();
          if (recommendations.length > 0) {
            console.log('💡 Performance Recommendations:');
            recommendations.forEach(rec => {
              console.log(`  - ${rec.metric}: ${rec.recommendation}`);
            });
          }
        }
      }
    }, 5000); // Wait 5 seconds for metrics to stabilize

    return () => {
      cleanup();
      lcpUnsubscribe();
      clsUnsubscribe();
      inpUnsubscribe();
      clearTimeout(logScore);
    };
  }, [location.pathname]); // Re-initialize on route change

  return null; // This component doesn't render anything
}

export default PerformanceMonitor;

