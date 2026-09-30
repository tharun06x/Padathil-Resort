(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuDetails = [...document.querySelectorAll('.site-header details')];

  const closeMenus = (exception = null) => {
    menuDetails.forEach((menu) => {
      if (menu !== exception) menu.open = false;
    });
  };

  menuDetails.forEach((menu) => {
    menu.addEventListener('toggle', () => {
      if (menu.open) closeMenus(menu);
    });
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenus());
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header details')) closeMenus();
  });

  // Open the stays menu on hover for mouse users; click still works everywhere.
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.desktop-nav .stay-menu-toggle').forEach((menu) => {
    let closeTimer = 0;
    menu.addEventListener('pointerenter', () => {
      if (!finePointer.matches) return;
      window.clearTimeout(closeTimer);
      menu.open = true;
    });
    menu.addEventListener('pointerleave', () => {
      if (!finePointer.matches) return;
      closeTimer = window.setTimeout(() => { menu.open = false; }, 180);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openMenu = menuDetails.find((menu) => menu.open);
    if (openMenu) {
      openMenu.open = false;
      openMenu.querySelector('summary')?.focus();
    }
  });

  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    if (Math.abs(window.scrollY - lastScrollY) > 4) closeMenus();
    lastScrollY = window.scrollY;
  }, { passive: true });

  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const href = link.getAttribute('href')?.split('#')[0] || '';
    if (href === currentPage) link.setAttribute('aria-current', 'page');
  });
  if (['nature-castle-vattavada.html', 'niva-waterways.html', 'riparian-ayur-resorts.html'].includes(currentPage)) {
    document.querySelector('.stay-menu-toggle > summary')?.setAttribute('aria-current', 'page');
  }

  const nearbyExplorer = document.querySelector('[data-nearby-explorer]');
  if (nearbyExplorer) {
    const config = JSON.parse(document.querySelector('#explorer-data').textContent);
    const places = config.places;
    const home = config.home;

    const image = nearbyExplorer.querySelector('[data-explorer-image]');
    const map = nearbyExplorer.querySelector('.explorer-map');
    const mapStatus = nearbyExplorer.querySelector('[data-map-status], #map-status');
    const landscape = nearbyExplorer.querySelector('[data-local-landscape]');
    const connection = nearbyExplorer.querySelector('[data-map-connection]');
    const mapDistance = nearbyExplorer.querySelector('[data-map-distance]');
    let imageTimer;
    const proximity = ([lat, lon]) => {
      const radians = value => value * Math.PI / 180;
      const a = Math.sin(radians(lat-home[0])/2)**2 + Math.cos(radians(home[0])) * Math.cos(radians(lat)) * Math.sin(radians(lon-home[1])/2)**2;
      return (6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
    };
    nearbyExplorer.querySelector('[data-map-home]')?.addEventListener('click', () => {
      if (mapStatus) mapStatus.textContent = config.homeNote;
      if (!reducedMotion.matches) landscape?.animate([{boxShadow:'inset 0 0 0 0 rgba(201,164,102,0)'},{boxShadow:'inset 0 0 0 3px rgba(201,164,102,.8)'},{boxShadow:'inset 0 0 0 0 rgba(201,164,102,0)'}],{duration:900});
    });
    nearbyExplorer.querySelector('[data-compass]')?.addEventListener('click', () => {
      if (mapStatus) mapStatus.textContent = 'North is up. There is no hurry to find your way.';
    });
    const fields = {
      number: nearbyExplorer.querySelector('[data-explorer-number]'),
      title: nearbyExplorer.querySelector('[data-explorer-title]'),
      description: nearbyExplorer.querySelector('[data-explorer-description]'),
      distance: nearbyExplorer.querySelector('[data-explorer-distance]'),
      best: nearbyExplorer.querySelector('[data-explorer-best]'),
      pace: nearbyExplorer.querySelector('[data-explorer-pace]'),
      link: nearbyExplorer.querySelector('[data-explorer-link]')
    };
    const pins = [...nearbyExplorer.querySelectorAll('[data-place]')];

    const selectPlace = (key) => {
      const place = places[key];
      if (!place) return;
      pins.forEach((pin) => {
        const selected = pin.dataset.place === key;
        pin.classList.toggle('is-active', selected);
        pin.setAttribute('aria-pressed', String(selected));
      });
      if (map) map.dataset.activePlace = key;
      if (landscape) {
        landscape.dataset.selected = key;
        const marker = pins.find(pin => pin.dataset.place === key && pin.dataset.mapX);
        if (connection && marker) {
          connection.setAttribute('x2', marker.dataset.mapX);
          connection.setAttribute('y2', marker.dataset.mapY);
          if (!reducedMotion.matches) connection.animate([{strokeDashoffset:120,opacity:.25},{strokeDashoffset:0,opacity:1}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)'});
        }
        if (mapDistance) {
          mapDistance.textContent = `${place.km || proximity(place.coordinates)} km`;
          const unit = mapDistance.nextElementSibling;
          if (unit) unit.textContent = place.km ? 'approx. road distance' : 'approx. straight-line distance';
        }
        if (mapStatus) mapStatus.textContent = place.note;
      } else if (mapStatus) mapStatus.textContent = `Selected route: ${place.title}`;
      image.classList.add('is-changing');
      window.clearTimeout(imageTimer);
      imageTimer = window.setTimeout(() => {
        image.src = place.image;
        image.alt = place.alt;
        image.classList.remove('is-changing');
      }, reducedMotion.matches ? 0 : 140);
      fields.number.textContent = place.number;
      fields.title.textContent = place.title;
      fields.description.textContent = place.description;
      fields.distance.textContent = place.km ? `≈ ${place.km} km by road` : landscape ? `≈ ${proximity(place.coordinates)} km straight-line` : place.distance;
      fields.best.textContent = place.best;
      fields.pace.textContent = place.pace;
      fields.link.href = place.link;
      fields.link.setAttribute('aria-label', `View ${place.title} on Maps`);
    };

    pins.forEach((pin) => pin.addEventListener('click', () => selectPlace(pin.dataset.place)));
    if (landscape) selectPlace(config.initial);
  }

  const loader = document.querySelector('#pageLoader');
  if (loader) {
    const startedAt = performance.now();
    let dismissed = false;
    let loaderSeen = false;
    try { loaderSeen = sessionStorage.getItem('padathil-loader-seen') === 'true'; } catch {}
    const dismissLoader = (immediate = false) => {
      if (dismissed) return;
      dismissed = true;
      try { sessionStorage.setItem('padathil-loader-seen', 'true'); } catch {}
      const elapsed = performance.now() - startedAt;
      const delay = immediate || reducedMotion.matches ? 0 : Math.max(0, 750 - elapsed);
      window.setTimeout(() => {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-loaded');
        loader.setAttribute('aria-hidden', 'true');
      }, delay);
    };
    window.addEventListener('load', () => dismissLoader(), { once: true });
    window.addEventListener('pointerdown', () => dismissLoader(true), { once: true, passive: true });
    window.addEventListener('keydown', () => dismissLoader(true), { once: true });
    window.setTimeout(() => dismissLoader(), 1200);
    if (loaderSeen) dismissLoader(true);
  }

  const toTop = document.querySelector('#toTop');
  if (toTop) {
    const updateToTop = () => toTop.classList.toggle('is-visible', window.scrollY > 520);
    updateToTop();
    window.addEventListener('scroll', updateToTop, { passive: true });
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    });
  }

  const galleryLinks = [...document.querySelectorAll('.gallery-card a')];
  if (!galleryLinks.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Gallery image viewer');
  lightbox.innerHTML = `
    <div class="lightbox-panel" role="document">
      <button class="lightbox-close" type="button" aria-label="Close image viewer">&times;</button>
      <button class="lightbox-control lightbox-prev" type="button" aria-label="Previous image">&#8592;</button>
      <figure>
        <img class="lightbox-image" alt="" />
        <figcaption class="lightbox-caption"></figcaption>
      </figure>
      <button class="lightbox-control lightbox-next" type="button" aria-label="Next image">&#8594;</button>
    </div>`;
  document.body.append(lightbox);

  const image = lightbox.querySelector('.lightbox-image');
  const caption = lightbox.querySelector('.lightbox-caption');
  const closeButton = lightbox.querySelector('.lightbox-close');
  let activeIndex = 0;
  let previousFocus = null;

  const renderImage = () => {
    const link = galleryLinks[activeIndex];
    const thumbnail = link.querySelector('img');
    image.src = link.href;
    image.alt = thumbnail?.alt || '';
    caption.textContent = link.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || image.alt;
  };

  const openLightbox = (index) => {
    activeIndex = index;
    previousFocus = document.activeElement;
    renderImage();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    image.removeAttribute('src');
    document.body.classList.remove('lightbox-open');
    previousFocus?.focus();
  };

  const step = (direction) => {
    activeIndex = (activeIndex + direction + galleryLinks.length) % galleryLinks.length;
    renderImage();
  };

  galleryLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openLightbox(index);
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => step(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => step(1));
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
    if (event.key !== 'Tab') return;
    const controls = [...lightbox.querySelectorAll('button:not([disabled])')];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
})();

(() => {
  const cards = document.querySelectorAll('.gallery-card');
  if (!cards.length || !document.documentElement.classList.contains('reveal-ready')) return;
  // Replays the reveal every time a card scrolls back into view.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.15) entry.target.classList.add('is-in');
      else if (!entry.isIntersecting) entry.target.classList.remove('is-in');
    });
  }, { threshold: [0, 0.15] });
  // Start after the page has painted so the first row's reveal is actually seen.
  const start = () => window.setTimeout(() => cards.forEach((card) => io.observe(card)), 350);
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();

// Home and Nature Castle pages: elements pop up as they scroll into view, and again on every pass.
(() => {
  const isHome = !!document.getElementById('welcome');
  const isNature = !!document.querySelector('.nc-page');
  const isRip = !!document.querySelector('.riparian-page');
  const isBlog = !!document.querySelector('.blog-grid');
  const isAbout = !!document.querySelector('.about-hero');
  const isContact = !!document.querySelector('.contact-hero');
  const isArticle = document.body.classList.contains('blog-article');
  if (!(isHome || isNature || isRip || isBlog || isAbout || isContact || isArticle) || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const homeTargets = [
    '#welcome .wrap > *',
    '#properties .wrap > div:first-child > *',
    '#properties .stay-choice',
    '#properties .property-compass > *',
    '#why-padathil figure',
    '#why-padathil .bg-panel',
    '#experience h2',
    '#experience .journal-tile',
    '#experience .wrap > p',
    '#our-story .wrap > *'
  ];
  const natureTargets = [
    '.nc-intro .wrap > *',
    '.nc-sig-head > *',
    '.nc-spec-row',
    '.nc-facts > div',
    '.nc-split > div',
    '.nc-glance h2',
    '.nc-glance .property-facts > div',
    '.nc-explore .wrap > :not(.nc-valley)',
    '.nc-plan .wrap > *'
  ];
  const ripTargets = [
    '.riparian-arrival .wrap > *',
    '.rp-sec .nc-sig-head > *',
    '.rp-facts > div',
    '.rp-perks li',
    '.riparian-story .nc-split > div > *',
    '.riparian-facts-section h2',
    '.riparian-facts-section .property-facts > div',
    '.riparian-explorer .wrap > *',
    '.riparian-close .wrap > *'
  ];
  const blogTargets = [
    'main > section:first-child .wrap > *',
    '.blog-card'
  ];
  const aboutTargets = [
    '.about-hero .wrap > *',
    '.about-split-text > *',
    'main section:nth-of-type(3) .wrap > div',
    '.about-cta .wrap > *'
  ];
  const contactTargets = [
    'main section h1', 'main section h2', 'main section p:not(article p)',
    'main section article', 'main section form', 'main section dl > div'
  ];
  const articleTargets = ['main h1', 'main h2', 'main p', 'main li'];
  const wipeTargets = ['.nc-photo', '.nc-valley', '.about-photo'];
  const seen = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.1) entry.target.classList.add('pop-in');
      else if (!entry.isIntersecting) entry.target.classList.remove('pop-in');
    });
  }, { threshold: [0, 0.1] });
  const watch = (selectors, cls) => document.querySelectorAll(selectors.join(',')).forEach((el) => {
    const i = seen.get(el.parentNode) || 0;
    seen.set(el.parentNode, i + 1);
    el.style.setProperty('--pop-d', `${Math.min(i, 3) * 0.12}s`);
    el.classList.add(cls);
    io.observe(el);
  });
  watch(isHome ? homeTargets : isRip ? ripTargets : isBlog ? blogTargets : isAbout ? aboutTargets : isContact ? contactTargets : isArticle ? articleTargets : natureTargets, 'pop');
  if (isNature || isRip || isAbout) watch(wipeTargets, 'wipe');
})();

// Home and Nature Castle pages: momentum (inertia) scrolling. Skipped for reduced motion or if the CDN script is blocked.
(() => {
  if (!(document.getElementById('welcome') || document.querySelector('.nc-page') || document.querySelector('.blog-grid') || document.querySelector('.about-hero') || document.querySelector('.contact-hero')) || !window.Lenis) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -92 } });
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
})();
