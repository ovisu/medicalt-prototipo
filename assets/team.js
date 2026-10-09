/* Native dialog keeps the background inert and supports Escape. */
(() => {
  'use strict';
  document.querySelectorAll('dialog.team-dialog').forEach((dialog) => {
    const triggers = document.querySelectorAll(`[aria-haspopup="dialog"][aria-controls="${dialog.id}"]`);
    let activeTrigger = null;
    const close = dialog.querySelector('.team-close');
    const list = dialog.querySelector('.team-dialog-list');

    let closeTimer;
    function finishClose() {
      clearTimeout(closeTimer);
      dialog.removeEventListener('animationend', onExitEnd);
      if (dialog.open) dialog.close();
    }
    function onExitEnd(event) {
      if (event.target === dialog && event.animationName === 'modal-exit') finishClose();
    }
    function requestClose() {
      if (!dialog.open || dialog.classList.contains('is-closing')) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        finishClose();
        return;
      }
      dialog.classList.add('is-closing');
      dialog.addEventListener('animationend', onExitEnd);
      closeTimer = setTimeout(finishClose, 240);
    }

    triggers.forEach((trigger) => trigger.addEventListener('click', () => {
      if (dialog.open) return;
      activeTrigger = trigger;
      dialog.showModal();
      document.documentElement.classList.add('team-dialog-open');
      list.scrollTop = 0;
      close.focus({ preventScroll: true });
    }));
    close.addEventListener('click', requestClose);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      requestClose();
    });
    dialog.addEventListener('close', () => {
      clearTimeout(closeTimer);
      dialog.removeEventListener('animationend', onExitEnd);
      dialog.classList.remove('is-closing');
      document.documentElement.classList.remove('team-dialog-open');
      activeTrigger?.focus({ preventScroll: true });
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
      if (pressedBackdrop && event.target === dialog && outside(event)) requestClose();
      pressedBackdrop = false;
    });
  });
})();
