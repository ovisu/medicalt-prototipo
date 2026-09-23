/* Native dialog keeps the background inert and supports Escape. */
(() => {
  'use strict';
  const dialog = document.getElementById('team-dialog');
  const trigger = document.getElementById('team-open');
  const close = document.getElementById('team-close');
  const list = dialog.querySelector('.team-dialog-list');

  trigger.addEventListener('click', () => {
    dialog.showModal();
    document.documentElement.classList.add('team-dialog-open');
    list.scrollTop = 0;
    close.focus({ preventScroll: true });
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('team-dialog-open');
    trigger.focus({ preventScroll: true });
  });
  // Dismiss only when both press and release happen on the backdrop.
  let pressedBackdrop = false;
  function outside(event) {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right
      || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  dialog.addEventListener('pointerdown', (event) => {
    pressedBackdrop = event.target === dialog && outside(event);
  });
  dialog.addEventListener('click', (event) => {
    if (pressedBackdrop && event.target === dialog && outside(event)) dialog.close();
    pressedBackdrop = false;
  });
})();
