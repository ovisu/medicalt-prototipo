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

  document.getElementById('current-year').textContent = String(
    new Date().getFullYear(),
  );
})();
