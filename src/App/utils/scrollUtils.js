/**
 * Smoothly scrolls to the specified element
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Optional offset from the element (default: 0)
 * @param {number} duration - Animation duration in milliseconds (default: 500)
 */
export const scrollToElement = (elementId, offset = 0, duration = 500) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  // Check if browser supports smooth scrolling natively
  if ('scrollBehavior' in document.documentElement.style) {
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } else {
    // Fallback for browsers that don't support smooth scrolling
    const startPosition = window.pageYOffset;
    const distance = offsetPosition - startPosition;
    let startTime = null;

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    // Easing function
    const easeInOutQuad = (t, b, c, d) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    requestAnimationFrame(animation);
  }
};

/**
 * Sets up smooth scrolling for all anchor links on the page
 */
export const setupSmoothAnchorLinks = () => {
  document.addEventListener('click', (e) => {
    // Check if the clicked element is an anchor link
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    // Prevent default anchor click behavior
    e.preventDefault();

    // Get the target element ID from the href
    const targetId = anchor.getAttribute('href').substring(1);
    if (!targetId) return;

    // Scroll to the target element
    scrollToElement(targetId, 80); // 80px offset for fixed headers
  });
}; 