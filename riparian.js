(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = [...document.querySelectorAll('[data-riparian-reveal]')];
  if (reduced || !sections.length) return;

  document.documentElement.classList.add('has-riparian-motion');
  const observer = new IntersectionObserver((entries, activeObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      activeObserver.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -48px' });
  sections.forEach((section) => observer.observe(section));
})();
