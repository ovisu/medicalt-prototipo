/* Progressive enhancement for navigation and services. */
(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('main-nav');
  const mobile = window.matchMedia('(max-width: 48rem)');

  function setMenu(open) {
    navigation.hidden = mobile.matches && !open;
    menuButton.setAttribute('aria-expanded', String(open));
  }

  function syncMenu() {
    menuButton.hidden = !mobile.matches;
    setMenu(!mobile.matches);
  }

  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a') && mobile.matches) {
      setMenu(false);
      // Do not leave keyboard focus on a now-hidden menu item.
      menuButton.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobile.matches && !navigation.hidden) {
      setMenu(false);
      menuButton.focus();
    }
  });
  mobile.addEventListener('change', syncMenu);
  syncMenu();

  const moreServices = document.querySelector('.services-more');
  const compactServices = window.matchMedia('(max-width: 64rem)');
  function syncServices() {
    moreServices.open = compactServices.matches;
  }
  compactServices.addEventListener('change', syncServices);
  syncServices();

  const heroActions = document.getElementById('hero-actions');
  if (heroActions) {
    const primaryAction = heroActions.querySelector('.cta');
    const servicesAction = heroActions.querySelector('.text-link');
    function syncHeroActions() {
      servicesAction.hidden = false;
      const primaryBounds = primaryAction.getBoundingClientRect();
      const servicesBounds = servicesAction.getBoundingClientRect();
      const besidePrimary = servicesBounds.left >= primaryBounds.right
        && servicesBounds.top < primaryBounds.bottom;
      servicesAction.hidden = !besidePrimary;
      if (!besidePrimary && document.activeElement === servicesAction) {
        primaryAction.focus({ preventScroll: true });
      }
    }
    syncHeroActions();
    if (window.ResizeObserver) {
      new window.ResizeObserver(syncHeroActions).observe(heroActions);
    } else {
      window.addEventListener('resize', syncHeroActions);
    }
    document.fonts?.ready.then(syncHeroActions);
  }

  document.getElementById('current-year').textContent = String(
    new Date().getFullYear(),
  );
})();
