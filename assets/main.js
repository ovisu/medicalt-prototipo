/* Progressive enhancement: reading, navigation and direct e-mail work without JS. */
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

  const form = document.getElementById('contact-form');
  const submit = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const message = document.getElementById('form-message');
  const config = window.MEDICALT_CONFIG || {};
  const email = config.contactEmail || '';
  const validEmail = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email);

  if (validEmail) {
    submit.disabled = false;
    submit.textContent = 'Revisar mensagem ↗';
    status.textContent = [
      'Revise o texto aqui e depois abra seu aplicativo de e-mail.',
      'Você confirma o envio por lá.',
      'Não inclua dados de pacientes.',
    ].join(' ');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validEmail || !form.reportValidity()) return;

    const fields = new FormData(form);
    const name = String(fields.get('name') || '').trim();
    const company = String(fields.get('company') || '').trim();
    document.getElementById('email-preview').hidden = true;
    if (!name || !company) {
      message.textContent = [
        'Preencha seu nome e a instituição,',
        'sem deixar os campos apenas com espaços.',
      ].join(' ');
      return;
    }

    const body = [
      'Olá, equipe Medicalt.',
      '',
      'Gostaria de conversar sobre uma parceria.',
      `Nome: ${name}`,
      `Instituição: ${company}`,
      `E-mail para retorno: ${String(fields.get('email') || '').trim()}`,
      `Interesse: ${String(fields.get('interest') || '')}`,
      '',
      'Podemos agendar uma conversa?',
    ].join('\r\n');

    const subject = config.contactSubject || 'Parceria hospitalar — Medicalt';
    const url = [
      `mailto:${email}?subject=${encodeURIComponent(subject)}`,
      `&body=${encodeURIComponent(body)}`,
    ].join('');
    message.textContent = [
      'Mensagem preparada para revisão abaixo.',
      'Nenhum e-mail foi enviado.',
    ].join(' ');
    // No fetch, storage or automatic dispatch. The visitor controls delivery.
    document.getElementById('email-body').textContent = body;
    document.getElementById('open-email').href = url;
    document.getElementById('email-preview').hidden = false;
  });

  form.addEventListener('input', () => {
    document.getElementById('email-preview').hidden = true;
    message.textContent = '';
  });
  form.addEventListener('change', () => {
    document.getElementById('email-preview').hidden = true;
    message.textContent = '';
  });

  document.getElementById('current-year').textContent = String(
    new Date().getFullYear(),
  );
})();
