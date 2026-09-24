/* Native POST preserves FormSubmit's anti-spam verification and no-JS fallback. */
(() => {
  'use strict';
  const form = document.getElementById('contact-form');
  const submit = document.getElementById('contact-submit');
  const message = document.getElementById('form-message');
  const config = window.MEDICALT_CONFIG || {};
  const email = config.contactEmail || '';
  const validEmail = /^[^\s@?&#/]+@[^\s@?&#/]+\.[^\s@?&#/]+$/.test(email);
  const served = /^https?:$/.test(window.location.protocol);
  let sending = false;

  if (validEmail) {
    form.action = `https://formsubmit.co/${email}`;
    form.elements.namedItem('_subject').value = config.contactSubject || 'Contato Medicalt';
  }
  if (served) {
    // Relative resolution preserves the repository prefix on GitHub Pages.
    form.elements.namedItem('_next').value = new URL('obrigado.html', window.location.href).href;
  }

  function resetSending() {
    sending = false;
    submit.disabled = !validEmail || !served;
    submit.textContent = 'Enviar mensagem ↗';
    form.setAttribute('aria-busy', 'false');
    message.textContent = !served
      ? 'Abra o site pelo servidor local ou pelo endereço publicado para enviar sua mensagem.'
      : !validEmail
        ? 'O envio está temporariamente indisponível. Tente novamente mais tarde.'
        : '';
  }

  form.addEventListener('submit', (event) => {
    if (sending || !validEmail || !served) {
      event.preventDefault();
      return;
    }
    for (const fieldName of ['name', 'company', 'email']) {
      const field = form.elements.namedItem(fieldName);
      field.value = field.value.trim();
    }
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    if (form.elements.namedItem('_honey').value) {
      event.preventDefault();
      return;
    }
    // Let the browser submit once. Never claim e-mail delivery before the provider responds.
    sending = true;
    submit.disabled = true;
    submit.textContent = 'Enviando…';
    form.setAttribute('aria-busy', 'true');
    message.textContent = 'Aguarde. Confirme a verificação de segurança, se solicitada, para concluir o envio.';
  });

  // Restore the form when returning from verification or a network error with Back.
  window.addEventListener('pageshow', resetSending);
  resetSending();
})();
