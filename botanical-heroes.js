(() => {
  'use strict';

  const scene = document.querySelector('.bougainvillea-canvas');
  if (!scene) return;

  // Native CSS runs the breeze. This observer only pauses invisible work;
  // there are no scroll listeners, frame loops, or animation dependencies.
  let inView = true;
  const updatePlayback = () => {
    scene.classList.toggle('is-breeze-paused', document.hidden || !inView);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updatePlayback();
    }, { rootMargin: '100px' });
    observer.observe(scene);
  }

  document.addEventListener('visibilitychange', updatePlayback);
  updatePlayback();
})();
