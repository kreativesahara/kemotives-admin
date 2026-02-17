/**
 * Core Web Vitals and Performance Monitoring Utility
 * 
 * Tracks and reports all key performance metrics:
 * - LCP (Largest Contentful Paint): 2.5s or less
 * - CLS (Cumulative Layout Shift): 0.1 or less
 * - INP (Interaction to Next Paint): 200ms or less
 * - FCP (First Contentful Paint): 1.8s or less
 * - FID (First Input Delay): 100ms or less
 * - TBT (Total Blocking Time): Under 800ms
 * - TTFB (Time to First Byte): Under 800ms
 * 
 * Integrates with Google Analytics and provides actionable insights.
 */

// Performance thresholds (in milliseconds or score)
const THRESHOLDS = {
  LCP: 2500,      // 2.5 seconds
  CLS: 0.1,       // 0.1 score
  INP: 200,       // 200 milliseconds
  FCP: 1800,      // 1.8 seconds
  FID: 100,       // 100 milliseconds
  TBT: 800,       // 800 milliseconds
  TTFB: 800,      // 800 milliseconds
};

// Performance rating helpers
const getRating = (value, threshold, metric) => {
  if (metric === 'CLS') {
    // CLS: lower is better
    return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'needs-improvement' : 'poor';
  }
  // For time-based metrics: lower is better
  return value <= threshold ? 'good' : value <= threshold * 1.5 ? 'needs-improvement' : 'poor';
};

// Store performance metrics
let performanceMetrics = {
  LCP: null,
  CLS: null,
  INP: null,
  FCP: null,
  FID: null,
  TBT: null,
  TTFB: null,
};

// Callbacks for metric updates
const metricCallbacks = new Map();

/**
 * Initialize performance monitoring
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onMetricUpdate - Callback when a metric is updated
 * @param {boolean} options.reportToAnalytics - Report to Google Analytics (default: true)
 * @param {boolean} options.logToConsole - Log metrics to console (default: false)
 * @returns {Function} Cleanup function
 */
export function initPerformanceMonitoring(options = {}) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  const {
    onMetricUpdate,
    reportToAnalytics = true,
    logToConsole = false
  } = options;

  const observers = [];

  // Helper to report metrics
  const reportMetric = (name, value, rating) => {
    performanceMetrics[name] = { value, rating, timestamp: Date.now() };

    if (logToConsole) {
      const unit = name === 'CLS' ? '' : 'ms';
      console.log(`[Performance] ${name}: ${value}${unit} (${rating})`);
    }

    // Report to Google Analytics if available
    if (reportToAnalytics && typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'web_vitals',
        metric_name: name,
        metric_value: value,
        metric_rating: rating,
        metric_id: `${name}_${Date.now()}`,
      });
    }

    // Call custom callback
    if (onMetricUpdate) {
      onMetricUpdate({ name, value, rating });
    }

    // Call registered callbacks
    const callbacks = metricCallbacks.get(name);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb({ name, value, rating });
        } catch (error) {
          console.error(`Error in ${name} callback:`, error);
        }
      });
    }
  };

  // 1. Largest Contentful Paint (LCP)
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = Math.round(lastEntry.renderTime || lastEntry.loadTime);
      const rating = getRating(lcp, THRESHOLDS.LCP, 'LCP');
      reportMetric('LCP', lcp, rating);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    observers.push(lcpObserver);
  } catch (error) {
    console.warn('LCP observer not supported:', error);
  }

  // 2. Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    let clsReported = false;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      // Only report CLS once when page is hidden or after inactivity
      if (!clsReported) {
        const rating = getRating(clsValue, THRESHOLDS.CLS, 'CLS');
        reportMetric('CLS', clsValue, rating);
        clsReported = true;
      }
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    observers.push(clsObserver);

    // Report final CLS when page is hidden
    const reportFinalCLS = () => {
      if (!clsReported && clsValue > 0) {
        const rating = getRating(clsValue, THRESHOLDS.CLS, 'CLS');
        reportMetric('CLS', clsValue, rating);
        clsReported = true;
      }
    };
    window.addEventListener('pagehide', reportFinalCLS, { once: true, passive: true });
  } catch (error) {
    console.warn('CLS observer not supported:', error);
  }

  // 3. Interaction to Next Paint (INP) - Track user interactions
  try {
    // Track interactions using Event Timing API
    let worstINP = 0;
    let inpReported = false;
    const interactionTypes = ['click', 'keydown', 'pointerdown'];
    
    const inpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only track user interactions (not all events)
        // INP = processingStart - startTime + duration (total latency)
        if (entry.entryType === 'event' && 
            interactionTypes.includes(entry.name) &&
            entry.duration !== undefined) {
          // Calculate total interaction latency
          const processingDelay = entry.processingStart ? 
            (entry.processingStart - entry.startTime) : 0;
          const inp = Math.round(processingDelay + entry.duration);
          
          // Track worst (highest) INP value
          if (inp > worstINP) {
            worstINP = inp;
          }
        }
      }
    });
    
    // Use buffered: true to catch early interactions
    inpObserver.observe({ 
      entryTypes: ['event'],
      buffered: true 
    });
    observers.push(inpObserver);

    // Report final INP when page is hidden (standard approach)
    const reportFinalINP = () => {
      if (!inpReported) {
        // Report worst INP, or 0 if no interactions occurred
        const rating = worstINP > 0 ? getRating(worstINP, THRESHOLDS.INP, 'INP') : 'good';
        reportMetric('INP', worstINP, rating);
        inpReported = true;
      }
    };
    
    window.addEventListener('pagehide', reportFinalINP, { once: true, passive: true });
  } catch (error) {
    console.warn('INP observer not supported:', error);
  }

  // 4. First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          const fcp = Math.round(entry.startTime);
          const rating = getRating(fcp, THRESHOLDS.FCP, 'FCP');
          reportMetric('FCP', fcp, rating);
        }
      }
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    observers.push(fcpObserver);
  } catch (error) {
    console.warn('FCP observer not supported:', error);
  }

  // 5. First Input Delay (FID)
  try {
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = Math.round(entry.processingStart - entry.startTime);
        const rating = getRating(fid, THRESHOLDS.FID, 'FID');
        reportMetric('FID', fid, rating);
      }
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    observers.push(fidObserver);
  } catch (error) {
    console.warn('FID observer not supported:', error);
  }

  // 6. Total Blocking Time (TBT) - Calculated from Long Tasks
  try {
    let totalBlockingTime = 0;
    let fcpTime = null;
    let ttiTime = null;
    let tbtReported = false;
    let tbtTimeout = null;
    let tbtPagehideHandler = null;

    // Get FCP time from existing paint entries or wait for it
    const getFCPTime = () => {
      if (performance.getEntriesByType) {
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint');
        if (fcpEntry) {
          fcpTime = fcpEntry.startTime;
        }
      }
    };
    getFCPTime();

    // Estimate TTI (Time to Interactive) - typically 5 seconds after DOMContentLoaded
    const estimateTTI = () => {
      if (performance.timing) {
        ttiTime = performance.timing.domContentLoadedEventEnd + 5000;
      } else if (performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          ttiTime = navEntries[0].domContentLoadedEventEnd + 5000;
        }
      }
    };
    
    if (document.readyState === 'complete') {
      estimateTTI();
    } else {
      window.addEventListener('load', estimateTTI, { once: true });
    }

    const reportTBT = () => {
      if (!tbtReported) {
        const rating = getRating(totalBlockingTime, THRESHOLDS.TBT, 'TBT');
        reportMetric('TBT', Math.round(totalBlockingTime), rating);
        tbtReported = true;
        
        // Cleanup
        if (tbtTimeout) clearTimeout(tbtTimeout);
        if (tbtPagehideHandler) {
          window.removeEventListener('pagehide', tbtPagehideHandler, { passive: true });
        }
      }
    };

    const tbtObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Only count long tasks between FCP and TTI
        if (entry.duration > 50) {
          const taskStart = entry.startTime;
          const taskEnd = taskStart + entry.duration;
          
          // Get FCP time if not set yet
          if (!fcpTime) getFCPTime();
          
          // Only count if task overlaps with FCP-TTI window (or if times not available, count all)
          if ((!fcpTime || taskEnd >= fcpTime) && (!ttiTime || taskStart <= ttiTime)) {
            totalBlockingTime += entry.duration - 50;
          }
        }
      }
      
      // Schedule TBT report (debounced)
      if (!tbtReported && !tbtTimeout) {
        tbtTimeout = setTimeout(reportTBT, 5000);
        tbtPagehideHandler = reportTBT;
        window.addEventListener('pagehide', tbtPagehideHandler, { once: true, passive: true });
      }
    });
    tbtObserver.observe({ entryTypes: ['longtask'] });
    observers.push(tbtObserver);
  } catch (error) {
    console.warn('TBT observer not supported:', error);
  }

  // 7. Time to First Byte (TTFB) - From Navigation Timing
  try {
    const measureTTFB = () => {
      if (performance.timing) {
        const ttfb = performance.timing.responseStart - performance.timing.requestStart;
        const rating = getRating(ttfb, THRESHOLDS.TTFB, 'TTFB');
        reportMetric('TTFB', Math.round(ttfb), rating);
      } else if (performance.getEntriesByType) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const entry = navigationEntries[0];
          const ttfb = entry.responseStart - entry.requestStart;
          const rating = getRating(ttfb, THRESHOLDS.TTFB, 'TTFB');
          reportMetric('TTFB', Math.round(ttfb), rating);
        }
      }
    };

    // Measure TTFB when page loads
    if (document.readyState === 'complete') {
      measureTTFB();
    } else {
      window.addEventListener('load', measureTTFB, { once: true });
    }
  } catch (error) {
    console.warn('TTFB measurement not supported:', error);
  }

  // Return cleanup function
  return () => {
    observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        // Ignore cleanup errors
      }
    });
  };
}

/**
 * Get current performance metrics
 * 
 * @returns {Object} Current performance metrics
 */
export function getPerformanceMetrics() {
  return { ...performanceMetrics };
}

/**
 * Get a specific performance metric
 * 
 * @param {string} metricName - Name of the metric (LCP, CLS, INP, etc.)
 * @returns {Object|null} Metric data or null if not available
 */
export function getMetric(metricName) {
  return performanceMetrics[metricName] || null;
}

/**
 * Register a callback for a specific metric
 * 
 * @param {string} metricName - Name of the metric
 * @param {Function} callback - Callback function
 * @returns {Function} Unregister function
 */
export function onMetricUpdate(metricName, callback) {
  if (typeof callback !== 'function') {
    console.warn('onMetricUpdate: callback must be a function');
    return () => {};
  }

  if (!metricCallbacks.has(metricName)) {
    metricCallbacks.set(metricName, new Set());
  }

  metricCallbacks.get(metricName).add(callback);

  return () => {
    const callbacks = metricCallbacks.get(metricName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        metricCallbacks.delete(metricName);
      }
    }
  };
}

/**
 * Get performance score (0-100) based on all metrics
 * 
 * @returns {Object} Performance score and breakdown
 */
export function getPerformanceScore() {
  const metrics = Object.keys(THRESHOLDS);
  let totalScore = 0;
  let availableMetrics = 0;
  const breakdown = {};

  metrics.forEach(metric => {
    const data = performanceMetrics[metric];
    if (data) {
      availableMetrics++;
      let score = 0;
      
      if (data.rating === 'good') {
        score = 100;
      } else if (data.rating === 'needs-improvement') {
        score = 50;
      } else {
        score = 0;
      }

      totalScore += score;
      breakdown[metric] = {
        score,
        rating: data.rating,
        value: data.value
      };
    }
  });

  const overallScore = availableMetrics > 0 ? Math.round(totalScore / availableMetrics) : 0;

  return {
    overall: overallScore,
    breakdown,
    availableMetrics,
    totalMetrics: metrics.length
  };
}

/**
 * Get performance recommendations based on current metrics
 * 
 * @returns {Array} Array of recommendation objects
 */
export function getPerformanceRecommendations() {
  const recommendations = [];
  const metrics = getPerformanceMetrics();

  if (metrics.LCP && metrics.LCP.rating !== 'good') {
    recommendations.push({
      metric: 'LCP',
      issue: 'Largest Contentful Paint is too slow',
      recommendation: 'Optimize images, use CDN, implement lazy loading, reduce server response time',
      priority: metrics.LCP.rating === 'poor' ? 'high' : 'medium'
    });
  }

  if (metrics.CLS && metrics.CLS.rating !== 'good') {
    recommendations.push({
      metric: 'CLS',
      issue: 'Cumulative Layout Shift detected',
      recommendation: 'Set size attributes on images/videos, avoid inserting content above existing content, use transform animations',
      priority: metrics.CLS.rating === 'poor' ? 'high' : 'medium'
    });
  }

  if (metrics.INP && metrics.INP.rating !== 'good') {
    recommendations.push({
      metric: 'INP',
      issue: 'Interaction to Next Paint is slow',
      recommendation: 'Optimize JavaScript execution, reduce main thread blocking, use Web Workers for heavy computations',
      priority: metrics.INP.rating === 'poor' ? 'high' : 'medium'
    });
  }

  if (metrics.FCP && metrics.FCP.rating !== 'good') {
    recommendations.push({
      metric: 'FCP',
      issue: 'First Contentful Paint is slow',
      recommendation: 'Minimize render-blocking resources, optimize CSS delivery, reduce server response time',
      priority: metrics.FCP.rating === 'poor' ? 'high' : 'medium'
    });
  }

  if (metrics.TTFB && metrics.TTFB.rating !== 'good') {
    recommendations.push({
      metric: 'TTFB',
      issue: 'Time to First Byte is slow',
      recommendation: 'Optimize server response time, use CDN, enable caching, reduce server-side processing',
      priority: metrics.TTFB.rating === 'poor' ? 'high' : 'medium'
    });
  }

  if (metrics.TBT && metrics.TBT.rating !== 'good') {
    recommendations.push({
      metric: 'TBT',
      issue: 'Total Blocking Time is high',
      recommendation: 'Break up long tasks, defer non-critical JavaScript, optimize third-party scripts',
      priority: metrics.TBT.rating === 'poor' ? 'high' : 'medium'
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Measure custom performance metric
 * 
 * @param {string} name - Name of the metric
 * @param {Function} fn - Function to measure
 * @returns {Promise} Promise that resolves with the measurement result
 */
export async function measurePerformance(name, fn) {
  if (typeof performance === 'undefined' || !performance.mark || !performance.measure) {
    return fn();
  }

  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  try {
    performance.mark(startMark);
    const result = await fn();
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    const measure = performance.getEntriesByName(name)[0];
    return {
      result,
      duration: measure.duration,
      startTime: measure.startTime
    };
  } catch (error) {
    // Clean up marks on error
    try {
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
    } catch {}
    throw error;
  }
}

/**
 * Check if performance monitoring is supported
 * 
 * @returns {boolean} True if PerformanceObserver is supported
 */
export function isPerformanceMonitoringSupported() {
  return typeof window !== 'undefined' && 'PerformanceObserver' in window;
}

/**
 * Get all performance entries for debugging
 * 
 * @param {string} entryType - Type of entries to retrieve
 * @returns {Array} Performance entries
 */
export function getPerformanceEntries(entryType = null) {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return [];
  }

  try {
    if (entryType) {
      return performance.getEntriesByType(entryType);
    }
    return performance.getEntries();
  } catch (error) {
    console.warn('Could not get performance entries:', error);
    return [];
  }
}

