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
    const places = {
      bhoothathankettu: {
        number: '01 / 04', title: 'Bhoothathankettu',
        description: 'Explore the scenic surroundings and enjoy the natural beauty of the region.',
        distance: 'A short drive away', best: 'Water views & an unhurried outing', pace: 'A relaxed half-day',
        image: 'images/bhoothathankettu.webp', alt: 'Boat cruise on the Bhoothathankettu reservoir surrounded by forest',
        link: 'https://www.google.com/maps/search/?api=1&query=Bhoothathankettu%2C%20Kerala'
      },
      thattekad: {
        number: '02 / 04', title: 'Thattekad Bird Sanctuary',
        description: 'A destination known for its diverse birdlife and peaceful forest environment.',
        distance: 'A nearby nature outing', best: 'Birdwatching & quiet forest time', pace: 'Start early and move slowly',
        image: 'images/thattekad.webp', alt: 'River and forested hills at Thattekad Bird Sanctuary',
        link: 'https://www.google.com/maps/search/?api=1&query=Thattekad%20Bird%20Sanctuary%2C%20Kerala'
      },
      inchathotty: {
        number: '03 / 04', title: 'Inchathotty Suspension Bridge',
        description: 'Experience one of the region’s scenic attractions surrounded by nature.',
        distance: 'Plan as a day outing', best: 'Views, riverside air & a change of pace', pace: 'Leave room to linger',
        image: 'images/inchathotty-bridge.webp', alt: 'Suspension bridge over a forest river near Inchathotty',
        link: 'https://www.google.com/maps/search/?api=1&query=Inchathotty%20Suspension%20Bridge%2C%20Kerala'
      },
      paniyeli: {
        number: '04 / 04', title: 'Paniyeli Poru',
        description: 'Discover the beauty of Kerala’s rocky river landscapes and rapids.',
        distance: 'Plan as a day outing', best: 'River landscapes & monsoon drama', pace: 'Best enjoyed without rushing',
        image: 'images/paniyeli-poru.webp', alt: 'Rocky river landscape and rapids at Paniyeli Poru',
        link: 'https://www.google.com/maps/search/?api=1&query=Paniyeli%20Poru%2C%20Kerala'
      }
    };

    const image = nearbyExplorer.querySelector('[data-explorer-image]');
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
      image.classList.add('is-changing');
      window.setTimeout(() => {
        image.src = place.image;
        image.alt = place.alt;
        image.classList.remove('is-changing');
      }, reducedMotion.matches ? 0 : 140);
      fields.number.textContent = place.number;
      fields.title.textContent = place.title;
      fields.description.textContent = place.description;
      fields.distance.textContent = place.distance;
      fields.best.textContent = place.best;
      fields.pace.textContent = place.pace;
      fields.link.href = place.link;
      fields.link.setAttribute('aria-label', `View ${place.title} on Maps`);
    };

    pins.forEach((pin) => pin.addEventListener('click', () => selectPlace(pin.dataset.place)));
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
