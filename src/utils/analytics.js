// initialize & helper functions for GA4
export const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

// log a page view (use this only for manual tracking if needed)
export function pageview(url) {
  dataLayer.push({
    event: 'page_view',
    page_path: url,
  });
}

// log custom events
export function event({ action, category, label, value }) {
  dataLayer.push({
    event: action,
    category,
    label,
    value,
  });
}

// log performance metrics (Core Web Vitals)
export function performanceMetric({ name, value, rating }) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    dataLayer.push({
      event: 'web_vitals',
      metric_name: name,
      metric_value: value,
      metric_rating: rating,
      metric_id: `${name}_${Date.now()}`,
    });
  }
} 