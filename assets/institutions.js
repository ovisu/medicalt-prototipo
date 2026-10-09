(() => {
  'use strict';
  const marquee = document.getElementById('institutions-marquee');
  // Auto mode scrolls only when the layout cannot fit all four institutions.
  if (!marquee || marquee.dataset.carouselEnabled === 'false') return;
  const track = marquee.querySelector('.institutions-track');
  const list = track.querySelector('.institutions-list');
  list.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
  const copy = list.cloneNode(true);
  copy.classList.add('institutions-copy');
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
  track.append(copy);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const compactLayout = window.matchMedia('(max-width: 64rem)');
  function syncMotion() {
    const enabled = marquee.dataset.carouselEnabled === 'true' || compactLayout.matches;
    marquee.classList.toggle('is-animated', enabled && !reducedMotion.matches);
  }
  reducedMotion.addEventListener('change', syncMotion);
  compactLayout.addEventListener('change', syncMotion);
  syncMotion();
})();
