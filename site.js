(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const imageLoadAnimations = new WeakMap();

  // Keep reserved image space useful while the browser fetches and decodes the
  // actual photograph. This is intentionally presentation-only: image sources,
  // lazy-loading and layout dimensions stay untouched.
  const imageLoader = {
    watch(image) {
      if (!image || image.matches('.site-logo, .local-map-ground, .hero-slide, .nc-slide')) return;

      const expectedSource = image.currentSrc || image.src;
      const wasAlreadyDecoded = image.complete && image.naturalWidth > 0;
      imageLoadAnimations.get(image)?.cancel();
      const reveal = () => {
        if ((image.currentSrc || image.src) !== expectedSource) return;
        image.classList.remove('is-image-loading');
        image.classList.add('is-image-ready');
        image.removeAttribute('aria-busy');

        // Let a photograph come gently into focus only if it actually loaded
        // while visible. Cached and offscreen images never slow down scrolling.
        const bounds = image.getBoundingClientRect();
        if (wasAlreadyDecoded || reducedMotion.matches || !image.animate ||
            bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
        const finalStyle = getComputedStyle(image);
        const animation = image.animate([
          { opacity: .38, filter: 'blur(8px) saturate(.7)' },
          { opacity: finalStyle.opacity, filter: finalStyle.filter }
        ], { duration: 720, easing: 'cubic-bezier(.16, 1, .3, 1)' });
        imageLoadAnimations.set(image, animation);
        animation.finished.finally(() => {
          if (imageLoadAnimations.get(image) === animation) imageLoadAnimations.delete(image);
        }).catch(() => {});
      };
      const fail = () => {
        if ((image.currentSrc || image.src) !== expectedSource) return;
        image.classList.remove('is-image-loading');
        image.classList.add('is-image-error');
        image.removeAttribute('aria-busy');
      };
      const decodeAndReveal = () => {
        if (typeof image.decode !== 'function') { reveal(); return; }
        image.decode().then(reveal).catch(() => {
          // Cached and SVG assets can reject decode after they have rendered.
          if (image.complete && image.naturalWidth) reveal(); else fail();
        });
      };

      image.classList.remove('is-image-ready', 'is-image-error');
      image.classList.add('is-image-loading');
      image.setAttribute('aria-busy', 'true');
      image.addEventListener('load', decodeAndReveal, { once: true });
      image.addEventListener('error', fail, { once: true });

      if (image.complete) {
        if (image.naturalWidth) decodeAndReveal(); else if (image.getAttribute('loading') !== 'lazy') fail();
      }
    }
  };
  window.PadathilImageLoader = imageLoader;
  document.querySelectorAll('img[src]').forEach((image) => imageLoader.watch(image));

  // Nearby places share the familiar geographic pin language. The resort's
  // own marker keeps its letter so guests can distinguish their base at once.
  const locationPin = '<svg viewBox="0 0 30 40" focusable="false"><path d="M15 1.5C8 1.5 2.5 7.1 2.5 14.1c0 9.4 12.5 24.4 12.5 24.4s12.5-15 12.5-24.4C27.5 7.1 22 1.5 15 1.5Z"/><circle cx="15" cy="14" r="4.3"/></svg>';
  document.querySelectorAll('.local-pin:not(.local-pin--home) .local-marker:empty').forEach((marker) => {
    marker.setAttribute('aria-hidden', 'true');
    marker.innerHTML = locationPin;
  });
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
  document.querySelectorAll('.stay-option').forEach((link) => {
    const href = link.getAttribute('href')?.split('#')[0] || '';
    if (href === currentPage) link.setAttribute('aria-current', 'page');
  });
  if (['nature-castle-vattavada.html', 'niva-waterways.html', 'riparian-ayur-resorts.html'].includes(currentPage)) {
    document.querySelector('.stay-menu-toggle > summary')?.setAttribute('aria-current', 'page');
  }

  // On a property page, make the next stay available in the header itself.
  // This keeps the three destinations feeling like a considered sequence rather
  // than making guests reopen the picker to continue exploring.
  const staySequence = [
    { path: 'nature-castle-vattavada.html', name: 'Nature Castle' },
    { path: 'niva-waterways.html', name: 'Niva Waterways' },
    { path: 'riparian-ayur-resorts.html', name: 'Riparian Resort' }
  ];
  const stayIndex = staySequence.findIndex((stay) => stay.path === currentPage);
  const stayRouteColors = {
    'nature-castle-vattavada.html': '#91b572',
    'niva-waterways.html': '#79c6df',
    'riparian-ayur-resorts.html': '#c9835e'
  };
  const stayHeroResources = {
    'nature-castle-vattavada.html': {
      src: 'images/banner/nc-slide-1.webp',
      srcset: 'images/banner/nc-slide-1-480w.webp 480w, images/banner/nc-slide-1-960w.webp 960w, images/banner/nc-slide-1.webp 1600w'
    },
    'niva-waterways.html': {
      src: 'images/banner/niva-slide-1.webp',
      srcset: 'images/banner/niva-slide-1-480w.webp 480w, images/banner/niva-slide-1-960w.webp 960w, images/banner/niva-slide-1.webp 1600w'
    },
    'riparian-ayur-resorts.html': {
      src: 'images/banner/rp-slide-1.webp',
      srcset: 'images/banner/rp-slide-1-480w.webp 480w, images/banner/rp-slide-1-960w.webp 960w, images/banner/rp-slide-1.webp 1600w'
    }
  };
  const warmedStays = new Set();
  const warmStay = (targetPath, isIntentional = false) => {
    const hero = stayHeroResources[targetPath];
    if (!hero || warmedStays.has(targetPath)) return;
    if (!isIntentional && navigator.connection?.saveData) return;
    warmedStays.add(targetPath);

    const documentPrefetch = document.createElement('link');
    documentPrefetch.rel = 'prefetch';
    documentPrefetch.href = targetPath;
    documentPrefetch.as = 'document';
    document.head.append(documentPrefetch);

    const heroPreload = document.createElement('link');
    heroPreload.rel = 'preload';
    heroPreload.as = 'image';
    heroPreload.href = hero.src;
    heroPreload.imageSrcset = hero.srcset;
    heroPreload.imageSizes = '100vw';
    heroPreload.fetchPriority = 'high';
    document.head.append(heroPreload);
  };
  let stayNavigationInProgress = false;
  let stayNavigationTimer;
  const transitionToStay = (event, targetPath) => {
    if (reducedMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (stayNavigationInProgress) return;
    stayNavigationInProgress = true;
    warmStay(targetPath, true);
    const route = document.querySelector('.riparian-hero-river path');
    const hero = document.querySelector('.riparian-hero');
    const heroBounds = hero?.getBoundingClientRect();
    const heroVisible = heroBounds && heroBounds.top < window.innerHeight * .3 && heroBounds.bottom > window.innerHeight * .7;
    if (!route || !heroVisible || !stayRouteColors[targetPath]) {
      window.location.href = targetPath;
      return;
    }

    // Keep the current photograph in place while the destination color traces
    // the same route, then let the destination page load normally.
    const routeLength = Math.ceil(route.getTotalLength());
    route.style.animation = 'none';
    route.style.strokeDashoffset = '0';
    const destinationRoute = route.cloneNode(false);
    destinationRoute.classList.add('stay-route-destination');
    destinationRoute.style.stroke = stayRouteColors[targetPath];
    destinationRoute.style.strokeDasharray = `${routeLength} ${routeLength}`;
    destinationRoute.style.strokeDashoffset = `${routeLength}`;
    route.after(destinationRoute);
    destinationRoute.animate(
      [{ strokeDashoffset: routeLength }, { strokeDashoffset: 0 }],
      { duration: 720, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' }
    );
    stayNavigationTimer = window.setTimeout(() => { window.location.href = targetPath; }, 740);
  };
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    window.clearTimeout(stayNavigationTimer);
    document.querySelector('.stay-route-destination')?.remove();
    stayNavigationInProgress = false;
  });
  if (stayIndex !== -1) {
    document.querySelectorAll('.stay-option, .mobile-stay-link').forEach((link) => {
      const targetPath = link.getAttribute('href')?.split('#')[0];
      if (!targetPath || targetPath === currentPage) return;
      link.addEventListener('pointerenter', () => warmStay(targetPath), { passive: true });
      link.addEventListener('focus', () => warmStay(targetPath));
      link.addEventListener('pointerdown', () => warmStay(targetPath, true), { passive: true });
      link.addEventListener('click', (event) => transitionToStay(event, targetPath));
    });
    const nextStay = staySequence[(stayIndex + 1) % staySequence.length];
    const nextLink = document.querySelector('[data-next-stay]');
    if (nextLink) {
      nextLink.addEventListener('pointerenter', () => warmStay(nextStay.path), { passive: true });
      nextLink.addEventListener('focus', () => warmStay(nextStay.path));
      nextLink.addEventListener('pointerdown', () => warmStay(nextStay.path, true), { passive: true });
      nextLink.addEventListener('click', (event) => transitionToStay(event, nextStay.path));
    }
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
        // This image changes with the selected place. Its initial responsive
        // source set belongs to the first photo, so discard it before loading
        // a different destination image.
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
        image.src = place.image;
        image.alt = place.alt;
        imageLoader.watch(image);
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
  let imageRequest = 0;

  const renderImage = () => {
    const link = galleryLinks[activeIndex];
    const thumbnail = link.querySelector('img');
    const request = ++imageRequest;
    image.classList.remove('is-ready');
    image.src = link.href;
    image.alt = thumbnail?.alt || '';
    caption.textContent = link.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || image.alt;
    const reveal = () => {
      if (request !== imageRequest) return;
      // Let a cached image restart its entrance when the visitor changes photos.
      void image.offsetWidth;
      image.classList.add('is-ready');
    };
    if (image.complete && image.naturalWidth) reveal();
    else image.addEventListener('load', reveal, { once: true });
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
    imageRequest++;
    image.classList.remove('is-ready');
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
  // Reveal each gallery card only on its first visit.
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio < 0.15) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: [0, 0.15] });
  // Start after the page has painted so the first row's reveal is actually seen.
  const start = () => window.setTimeout(() => cards.forEach((card) => io.observe(card)), 350);
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();

// Unveil photographs once as they enter view; text and controls remain steady.
(() => {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const photos = document.querySelectorAll(
    '#properties .property-card figure, #why-padathil figure, #experience .journal-tile figure, ' +
    '.nc-page .nc-photo, .nc-page .nc-valley, .riparian-page .nc-photo, ' +
    '.about-photo, .blog-card figure'
  );
  if (!photos.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio < 0.08) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: [0, 0.08] });
  photos.forEach((photo) => {
    photo.classList.add('media-reveal');
    io.observe(photo);
  });
})();

// Momentum scrolling is used on the home and selected interior pages.
(() => {
  if (!(document.getElementById('welcome') || document.querySelector('.nc-page') || document.querySelector('.blog-grid') || document.querySelector('.about-hero') || document.querySelector('.contact-hero') || document.querySelector('.faq-list')) || !window.Lenis) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, anchors: { offset: -92 } });
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
})();

// FAQ accordion: opening one question closes the others, and answers fade out as they close.
(() => {
  const items = [...document.querySelectorAll('.faq-list details')];
  if (!items.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const close = (item) => {
    if (!item.open || item.dataset.closing) return;
    const answer = item.querySelector('.body-copy');
    if (reduced || !answer) { item.open = false; return; }
    item.dataset.closing = '1';
    // Collapse and fade together; keep the faded end state until the collapse has finished so the text never flashes back.
    answer.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 280, easing: 'ease', fill: 'forwards' });
    item.open = false;
    window.setTimeout(() => { answer.getAnimations().forEach((a) => a.cancel()); delete item.dataset.closing; }, 520);
  };
  items.forEach((item) => {
    item.querySelector('summary').addEventListener('click', (event) => {
      event.preventDefault();
      if (item.open) { close(item); return; }
      items.forEach((other) => { if (other !== item) close(other); });
      item.open = true;
    });
  });
})();

// Primary enquiry actions collect just enough context before opening WhatsApp.
// The floating WhatsApp control remains an immediate, no-form route for guests
// who already know what they want to ask.
(() => {
  const directChatUrl = 'https://wa.me/919447738990?text=Hello%20Padathil%20Stays%2C%20I%20would%20like%20to%20enquire.';
  document.querySelectorAll('a[aria-label="Chat on WhatsApp"]').forEach((link) => {
    link.setAttribute('href', directChatUrl);
  });
  const enquiryLinks = [...document.querySelectorAll('a[href*="wa.me/"]')]
    .filter((link) => link.getAttribute('aria-label') !== 'Chat on WhatsApp');
  if (!enquiryLinks.length) return;

  const pageProperty = {
    'nature-castle-vattavada.html': 'Nature Castle Resort',
    'niva-waterways.html': 'Niva Waterways',
    'riparian-ayur-resorts.html': 'Riparian Resort'
  }[location.pathname.split('/').pop() || ''];

  const dialog = document.createElement('dialog');
  dialog.className = 'quick-enquiry-dialog';
  dialog.setAttribute('aria-labelledby', 'quick-enquiry-title');
  dialog.innerHTML = `
    <div class="quick-enquiry-shell">
      <button class="quick-enquiry-close" type="button" aria-label="Close quick enquiry">&times;</button>
      <div class="quick-enquiry-lead">
        <h2 id="quick-enquiry-title">Plan your stay.</h2>
        <p>A few details help the Padathil team respond with the right information.</p>
      </div>
      <form class="quick-enquiry-form" novalidate>
        <div class="quick-enquiry-selects">
          <label>Stay preference
            <select name="property">
              <option value="Not sure yet">Help me choose a stay</option>
              <option value="Nature Castle Resort">Nature Castle Resort</option>
              <option value="Niva Waterways">Niva Waterways</option>
              <option value="Riparian Resort">Riparian Resort</option>
            </select>
          </label>
          <label>How can we help?
            <select name="intent">
              <option value="A stay">A stay</option>
              <option value="A group stay">A group stay</option>
              <option value="A celebration or special request">A celebration or special request</option>
              <option value="Help choosing a stay">Help me choose</option>
            </select>
          </label>
        </div>
        <div class="quick-enquiry-fields">
          <label>Check-in <span>optional</span><input type="date" name="checkIn"></label>
          <label>Check-out <span>optional</span><input type="date" name="checkOut"></label>
          <label>Guests <span>optional</span><input type="number" name="guests" min="1" inputmode="numeric" placeholder="How many?"></label>
        </div>
        <label class="quick-enquiry-note">A note for the team <span>optional</span><textarea name="note" rows="2" placeholder="Questions, occasion, or anything else."></textarea></label>
        <p class="quick-enquiry-error" role="alert" hidden></p>
        <div class="quick-enquiry-actions">
          <button type="submit" class="quick-enquiry-submit">Continue to WhatsApp <span aria-hidden="true">→</span></button>
          <a class="quick-enquiry-skip" data-quick-enquiry-bypass href="https://wa.me/919447738990?text=Hello%20Padathil%20Stays%2C%20I%20would%20like%20to%20enquire." target="_blank" rel="noopener">Chat without details</a>
        </div>
      </form>
    </div>`;
  document.body.append(dialog);

  const form = dialog.querySelector('.quick-enquiry-form');
  const closeButton = dialog.querySelector('.quick-enquiry-close');
  const error = dialog.querySelector('.quick-enquiry-error');
  let trigger = null;

  const getMessageText = (link) => {
    try { return new URL(link.href).searchParams.get('text') || ''; }
    catch { return ''; }
  };
  const getPropertyFor = (link) => {
    const message = getMessageText(link);
    if (/Nature Castle/i.test(message)) return 'Nature Castle Resort';
    if (/Niva Waterways/i.test(message)) return 'Niva Waterways';
    if (/Riparian/i.test(message)) return 'Riparian Resort';
    return pageProperty || 'Not sure yet';
  };
  const setSelected = (name, value) => {
    const control = form.elements.namedItem(name);
    if (control) control.value = value;
  };
  const openEnquiry = (link) => {
    trigger = link;
    form.reset();
    error.hidden = true;
    setSelected('property', getPropertyFor(link));
    if (/recommend|help.*choose/i.test(`${link.textContent} ${getMessageText(link)}`)) {
      setSelected('intent', 'Help choosing a stay');
    }
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else {
      dialog.setAttribute('open', '');
      closeButton.focus();
    }
  };
  const closeEnquiry = () => {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };
  const readableDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      .format(new Date(`${value}T00:00:00`));
  };

  enquiryLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openEnquiry(link);
    });
  });
  closeButton.addEventListener('click', closeEnquiry);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeEnquiry();
  });
  dialog.addEventListener('close', () => {
    error.hidden = true;
    trigger?.focus();
  });
  form.addEventListener('input', () => { error.hidden = true; });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const checkIn = data.get('checkIn');
    const checkOut = data.get('checkOut');
    if (checkIn && checkOut && checkOut <= checkIn) {
      error.textContent = 'Choose a check-out date after your check-in date.';
      error.hidden = false;
      form.elements.checkOut.focus();
      return;
    }
    const lines = [
      'Hello Padathil Stays,',
      '',
      'I would like to enquire.',
      `Stay: ${data.get('property')}`,
      `Looking for: ${data.get('intent')}`
    ];
    if (checkIn) lines.push(`Check-in: ${readableDate(checkIn)}`);
    if (checkOut) lines.push(`Check-out: ${readableDate(checkOut)}`);
    if (data.get('guests')) lines.push(`Guests: ${data.get('guests')}`);
    if (data.get('note')?.trim()) lines.push(`Questions: ${data.get('note').trim()}`);
    const whatsappUrl = `https://wa.me/919447738990?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    closeEnquiry();
  });
})();
