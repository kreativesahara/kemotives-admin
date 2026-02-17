/**
 * Back/Forward Cache (bfcache) optimization utilities
 * 
 * bfcache allows browsers to instantly restore pages when navigating
 * back/forward, significantly improving navigation performance.
 * 
 * These utilities help ensure proper bfcache behavior and handle
 * page restoration events correctly.
 * 
 * Performance optimizations:
 * - Shared event listeners (singleton pattern)
 * - Batched callback execution
 * - RequestAnimationFrame for visual updates
 * - Optimized debouncing with immediate option
 * - Performance measurement helpers
 * - Memory-efficient cleanup
 */

// Performance optimizations: Cache browser capabilities
let _bfcacheSupported = null;
let _performanceSupported = null;
let _hasPerformanceAPI = null;
let _hasIdleCallback = null;

// Check browser capabilities once
if (typeof window !== 'undefined') {
  _hasPerformanceAPI = 'performance' in window && 'mark' in performance && 'measure' in performance;
  _hasIdleCallback = 'requestIdleCallback' in window;
}

// Shared event handlers (singleton pattern for better performance)
let pageshowHandler = null;
let pagehideHandler = null;
const restoreCallbacksSet = new Set();
const cleanupCallbacksSet = new Set();

// Batch execution state
let batchScheduled = false;
let batchCallbacks = [];

/**
 * Optimized debounce with immediate option
 */
const debounce = (fn, delay = 0, immediate = false) => {
  let timeoutId;
  return (...args) => {
    const callNow = immediate && !timeoutId;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) fn(...args);
    }, delay);
    if (callNow) fn(...args);
  };
};

/**
 * Performance measurement helper (DRY)
 */
const measurePerformance = (name, fn) => {
  if (!_hasPerformanceAPI) {
    return fn();
  }
  
  const startMark = `${name}-start`;
  const endMark = `${name}-end`;
  
  try {
    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    return result;
  } catch (error) {
    // Clean up marks on error
    try {
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
    } catch {}
    throw error;
  }
};

/**
 * Optimized callback scheduler
 */
const scheduleCallback = (callback, options = {}) => {
  const {
    useIdleCallback = true,
    useAnimationFrame = false,
    priority = 'normal' // 'high', 'normal', 'low'
  } = options;

  if (useAnimationFrame && 'requestAnimationFrame' in window) {
    return () => requestAnimationFrame(callback);
  }

  if (useIdleCallback && _hasIdleCallback && priority !== 'high') {
    const timeout = priority === 'low' ? 2000 : 1000;
    return () => requestIdleCallback(callback, { timeout });
  }

  // Use microtask for high priority, setTimeout for others
  return priority === 'high'
    ? () => queueMicrotask(callback)
    : () => setTimeout(callback, 0);
};

/**
 * Batch execute callbacks for better performance
 */
const batchExecute = (callbacks) => {
  if (callbacks.length === 0) return;
  
  // Use requestAnimationFrame for visual updates
  if ('requestAnimationFrame' in window) {
    requestAnimationFrame(() => {
      callbacks.forEach(cb => {
        try {
          cb();
        } catch (error) {
          console.error('Error in batched callback:', error);
        }
      });
    });
  } else {
    // Fallback to microtask
    queueMicrotask(() => {
      callbacks.forEach(cb => {
        try {
          cb();
        } catch (error) {
          console.error('Error in batched callback:', error);
        }
      });
    });
  }
};

/**
 * Handle bfcache restoration - reinitialize components if needed
 * 
 * Optimized version with:
 * - Batched callback execution
 * - RequestAnimationFrame for visual updates
 * - Optimized debouncing
 * - Performance measurement
 * - Priority-based scheduling
 * 
 * @param {Function} callback - Function to call when page is restored from bfcache
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 0)
 * @param {boolean} options.useIdleCallback - Use requestIdleCallback if available (default: true)
 * @param {boolean} options.useAnimationFrame - Use requestAnimationFrame for visual updates (default: false)
 * @param {boolean} options.measurePerformance - Add performance marks (default: false)
 * @param {string} options.priority - Callback priority: 'high', 'normal', 'low' (default: 'normal')
 * @returns {Function} Cleanup function to remove the event listener
 * 
 * @example
 * // In a React component
 * useEffect(() => {
 *   const cleanup = handleBfcacheRestore(() => {
 *     // Re-fetch data or reinitialize component
 *     fetchData();
 *   }, { 
 *     debounceMs: 100, 
 *     measurePerformance: true,
 *     useAnimationFrame: true,
 *     priority: 'high'
 *   });
 *   return cleanup;
 * }, []);
 */
export function handleBfcacheRestore(callback, options = {}) {
  if (typeof window === 'undefined') return () => {};

  // Early return for invalid callbacks
  if (typeof callback !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('handleBfcacheRestore: callback must be a function');
    }
    return () => {};
  }

  const {
    debounceMs = 0,
    useIdleCallback = true,
    useAnimationFrame = false,
    measurePerformance: shouldMeasure = false,
    priority = 'normal'
  } = options;

  // Create optimized callback wrapper
  const executeCallback = () => {
    if (shouldMeasure) {
      measurePerformance('bfcache-restore', callback);
    } else {
      try {
        callback();
      } catch (error) {
        console.error('Error in bfcache restore callback:', error);
      }
    }
  };

  // Apply debouncing if needed
  const debouncedCallback = debounceMs > 0
    ? debounce(executeCallback, debounceMs)
    : executeCallback;

  // Schedule callback execution
  const scheduler = scheduleCallback(debouncedCallback, {
    useIdleCallback,
    useAnimationFrame,
    priority
  });

  const wrappedCallback = scheduler;

  restoreCallbacksSet.add(wrappedCallback);

  // Create shared event handler if it doesn't exist
  if (!pageshowHandler) {
    pageshowHandler = (event) => {
      // event.persisted is true when page was restored from bfcache
      if (event.persisted && restoreCallbacksSet.size > 0) {
        // Batch execute all callbacks for better performance
        const callbacks = Array.from(restoreCallbacksSet);
        batchExecute(callbacks);
      }
    };

    // Use passive listener for better performance
    window.addEventListener('pageshow', pageshowHandler, { passive: true });
  }

  // Return cleanup function
  return () => {
    restoreCallbacksSet.delete(wrappedCallback);
    
    // Clean up shared handler if no callbacks remain
    if (restoreCallbacksSet.size === 0 && pageshowHandler) {
      window.removeEventListener('pageshow', pageshowHandler, { passive: true });
      pageshowHandler = null;
    }
  };
}

/**
 * Cleanup function to ensure proper bfcache behavior
 * 
 * Optimized version with:
 * - Shared event listeners
 * - Priority-based cleanup
 * - Batched execution
 * - Performance monitoring
 * 
 * Avoids using 'unload' or 'beforeunload' which block bfcache.
 * Uses 'pagehide' event instead, which is bfcache-compatible.
 * 
 * @param {Function} cleanup - Cleanup function to call when page is unloaded
 * @param {Object} options - Configuration options
 * @param {boolean} options.critical - If true, executes immediately; otherwise uses requestIdleCallback (default: false)
 * @param {boolean} options.measurePerformance - Add performance marks (default: false)
 * @returns {Function} Cleanup function to remove the event listener
 * 
 * @example
 * // In a React component
 * useEffect(() => {
 *   const cleanup = setupBfcacheCleanup(() => {
 *     // Cleanup resources (but only if not cached)
 *     clearInterval(timerId);
 *     closeWebSocket();
 *   }, { critical: true });
 *   return cleanup;
 * }, []);
 */
export function setupBfcacheCleanup(cleanup, options = {}) {
  if (typeof window === 'undefined') return () => {};

  // Early return for invalid cleanup functions
  if (typeof cleanup !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('setupBfcacheCleanup: cleanup must be a function');
    }
    return () => {};
  }

  const {
    critical = false,
    measurePerformance: shouldMeasure = false
  } = options;

  // Wrap cleanup with performance monitoring
  const executeCleanup = () => {
    if (shouldMeasure) {
      measurePerformance('bfcache-cleanup', cleanup);
    } else {
      try {
        cleanup();
      } catch (error) {
        console.error('Error in bfcache cleanup callback:', error);
      }
    }
  };

  // Use immediate execution for critical cleanup, otherwise schedule
  const wrappedCleanup = critical
    ? executeCleanup
    : scheduleCallback(executeCleanup, {
        useIdleCallback: true,
        priority: 'low'
      });

  cleanupCallbacksSet.add(wrappedCleanup);

  // Create shared event handler if it doesn't exist
  if (!pagehideHandler) {
    pagehideHandler = (event) => {
      // Only cleanup if page is being unloaded (not cached)
      if (!event.persisted && cleanupCallbacksSet.size > 0) {
        // Batch execute all cleanup callbacks
        const callbacks = Array.from(cleanupCallbacksSet);
        batchExecute(callbacks);
      }
    };

    // Use passive listener for better performance
    window.addEventListener('pagehide', pagehideHandler, { passive: true });
  }

  // Return cleanup function
  return () => {
    cleanupCallbacksSet.delete(wrappedCleanup);
    
    // Clean up shared handler if no callbacks remain
    if (cleanupCallbacksSet.size === 0 && pagehideHandler) {
      window.removeEventListener('pagehide', pagehideHandler, { passive: true });
      pagehideHandler = null;
    }
  };
}

/**
 * Check if bfcache is supported by the current browser
 * 
 * Optimized with memoization to avoid repeated checks.
 * 
 * @returns {boolean} True if bfcache is likely supported
 */
export function isBfcacheSupported() {
  if (typeof window === 'undefined') return false;
  
  // Memoize result for performance
  if (_bfcacheSupported !== null) {
    return _bfcacheSupported;
  }

  // Check for pageshow event support (indicates bfcache capability)
  // Also check for pagehide which is required for proper bfcache
  _bfcacheSupported = 'onpageshow' in window && 'onpagehide' in window;
  
  return _bfcacheSupported;
}

/**
 * Get bfcache statistics if available
 * 
 * Optimized with caching and additional metrics.
 * 
 * @param {boolean} forceRefresh - Force refresh of cached stats (default: false)
 * @returns {Object|null} bfcache statistics or null if not available
 */
export function getBfcacheStats(forceRefresh = false) {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return null;
  }

  // Cache result for performance (unless force refresh)
  if (!forceRefresh && _performanceSupported === false) {
    return null;
  }

  try {
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length === 0) {
      _performanceSupported = false;
      return null;
    }

    _performanceSupported = true;
    const entry = navigationEntries[0];
    
    // Calculate additional useful metrics
    const stats = {
      type: entry.type, // 'navigate', 'reload', 'back_forward', etc.
      isBackForward: entry.type === 'back_forward',
      loadEventEnd: entry.loadEventEnd,
      domContentLoadedEventEnd: entry.domContentLoadedEventEnd,
      // Additional performance metrics
      domInteractive: entry.domInteractive,
      domComplete: entry.domComplete,
      loadEventStart: entry.loadEventStart,
      // Calculate durations
      domContentLoadedDuration: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadDuration: entry.loadEventEnd - entry.loadEventStart,
    };

    // Add bfcache-specific metrics if available (Chrome 96+)
    if ('restoreType' in entry) {
      stats.restoreType = entry.restoreType; // 'none', 'restored', 'cached'
      stats.wasRestored = entry.restoreType === 'restored';
    }

    return stats;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Could not get bfcache stats:', error);
    }
    _performanceSupported = false;
    return null;
  }
}

/**
 * Monitor bfcache events and log performance metrics
 * 
 * Useful for debugging and performance monitoring.
 * 
 * @param {Function} onRestore - Callback when page is restored from bfcache
 * @param {Function} onCache - Callback when page is cached
 * @returns {Function} Cleanup function
 */
export function monitorBfcache(onRestore, onCache) {
  if (typeof window === 'undefined') return () => {};

  const handlePageshow = (event) => {
    if (event.persisted && typeof onRestore === 'function') {
      const stats = getBfcacheStats();
      onRestore({ event, stats });
    }
  };

  const handlePagehide = (event) => {
    if (event.persisted && typeof onCache === 'function') {
      onCache({ event });
    }
  };

  window.addEventListener('pageshow', handlePageshow, { passive: true });
  window.addEventListener('pagehide', handlePagehide, { passive: true });

  return () => {
    window.removeEventListener('pageshow', handlePageshow, { passive: true });
    window.removeEventListener('pagehide', handlePagehide, { passive: true });
  };
}

/**
 * Preload critical resources when page is about to be cached
 * 
 * Optimized with Resource Hints API and better resource type detection.
 * 
 * @param {string[]} urls - Array of URLs to preload
 * @param {Object} options - Configuration options
 * @param {string} options.fetchPriority - Fetch priority: 'high', 'low', 'auto' (default: 'low')
 * @returns {Function} Cleanup function
 */
export function preloadOnBfcache(urls = [], options = {}) {
  if (typeof window === 'undefined' || !Array.isArray(urls) || urls.length === 0) {
    return () => {};
  }

  const { fetchPriority = 'low' } = options;
  const preloadedUrls = new Set();

  const handlePagehide = (event) => {
    // Preload resources when page is being cached
    if (event.persisted) {
      urls.forEach(url => {
        // Avoid duplicate preloads
        if (preloadedUrls.has(url)) return;
        preloadedUrls.add(url);

        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        
        // Detect resource type
        if (url.endsWith('.css')) {
          link.as = 'style';
        } else if (url.endsWith('.js')) {
          link.as = 'script';
        } else if (url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
          link.as = 'image';
        } else {
          link.as = 'fetch';
        }

        // Set fetch priority if supported
        if ('fetchPriority' in link) {
          link.fetchPriority = fetchPriority;
        }

        // Use crossorigin for cross-origin resources
        try {
          const urlObj = new URL(url, window.location.href);
          if (urlObj.origin !== window.location.origin) {
            link.crossOrigin = 'anonymous';
          }
        } catch {}

        document.head.appendChild(link);
      });
    }
  };

  window.addEventListener('pagehide', handlePagehide, { passive: true });

  return () => {
    window.removeEventListener('pagehide', handlePagehide, { passive: true });
    preloadedUrls.clear();
  };
}
