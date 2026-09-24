import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

const codeFiles = [
  path.join(root, 'index.html'),
  path.join(root, 'assets', 'config.js'),
  path.join(root, 'assets', 'main.js'),
  path.join(root, 'assets', 'contact.js'),
  path.join(root, 'obrigado.html'),
  path.join(root, 'assets', 'styles.css'),
  fileURLToPath(import.meta.url),
  fileURLToPath(new URL('./serve.mjs', import.meta.url)),
];

for (const filename of codeFiles) {
  const source = await readFile(filename, 'utf8');

  for (const [index, line] of source.split('\n').entries()) {
    assert(!line.includes('\t'), `Tab found in ${filename}:${index + 1}`);
    assert(!/[ \t]+$/.test(line), `Trailing whitespace in ${filename}:${index + 1}`);

    const indentation = line.match(/^ */)[0].length;
    assert.equal(
      indentation % 2,
      0,
      `Indentation must use two-space levels in ${filename}:${index + 1}`,
    );
  }
}

assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML id');
assert.match(html, /<html lang="pt-BR">/);
assert.match(html, /name="viewport"/);
assert.equal((html.match(/<h1\b/g) || []).length, 1, 'Exactly one h1');
assert.equal((html.match(/<main\b/g) || []).length, 1, 'Exactly one main');
assert.doesNotMatch(
  html,
  /__(LOGO|PHOTO)__|window\.openai|globalThis\.Tweak/,
);

// Structural check catches malformed nesting inherited from drafts.
const voidTags = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);
const stack = [];

for (const match of html.matchAll(/<(\/?)([a-z][a-z0-9-]*)\b[^>]*>/gi)) {
  const [full, close, tagName] = match;
  const tag = tagName.toLowerCase();

  if (voidTags.has(tag)) {
    continue;
  }

  if (close) {
    assert.equal(stack.pop(), tag, `Mismatched closing tag ${tag}`);
  } else if (!full.endsWith('/>')) {
    stack.push(tag);
  }
}

assert.equal(stack.length, 0, 'Unclosed tags');

for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  const target = match[1];

  if (target.startsWith('#')) {
    assert(ids.includes(target.slice(1)), `Missing anchor: ${target}`);
  } else if (!/^(https?:|mailto:)/.test(target)) {
    await access(path.join(root, target));
  }
}

for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  assert.match(match[0], /\balt="/);
  assert.match(match[0], /\bwidth="\d+"/);
  assert.match(match[0], /\bheight="\d+"/);
}

for (const name of ['config.js', 'main.js', 'contact.js', 'team.js']) {
  const check = spawnSync(
    process.execPath,
    ['--check', path.join(root, 'assets', name)],
    { encoding: 'utf8' },
  );
  assert.equal(check.status, 0, check.stderr);
}

// Exercise navigation without browser side effects.
const makeElement = () => ({
  hidden: false,
  disabled: true,
  textContent: '',
  href: '',
  events: {},
  attrs: {},
  addEventListener(name, callback) {
    this.events[name] = callback;
  },
  setAttribute(name, value) {
    this.attrs[name] = value;
  },
  getAttribute(name) {
    return this.attrs[name];
  },
  focus() {},
  reportValidity() {
    return true;
  },
});

const elementIds = [
  'main-nav',
  'contact-form',
  'contact-submit',
  'contact-status',
  'form-message',
  'current-year',
  'email-preview',
  'email-body',
  'open-email',
];
const elements = Object.fromEntries(
  elementIds.map((id) => [id, makeElement()]),
);
const menu = makeElement();
const directEmail = makeElement();
const moreServices = makeElement();
const serviceMedia = {
  matches: true,
  addEventListener(name, callback) { this.change = callback; },
};
const media = {
  matches: true,
  addEventListener() {},
};
const fields = {
  name: 'João & Maria',
  company: 'Hospital A/B',
  email: 'retorno@example.com',
  interest: 'Estruturação de UTI',
};
const windowMock = {
  location: { href: '' },
  matchMedia: (query) => query.includes('64rem') ? serviceMedia : media,
};
const documentMock = {
  getElementById: (id) => elements[id],
  querySelector: (selector) => selector === '.services-more' ? moreServices : menu,
  querySelectorAll: () => [directEmail],
  addEventListener() {},
};
const context = vm.createContext({
  window: windowMock,
  document: documentMock,
  FormData: class {
    get(name) {
      return fields[name];
    }
  },
  Date,
});

vm.runInContext(
  await readFile(path.join(root, 'assets/config.js'), 'utf8'),
  context,
);
vm.runInContext(
  await readFile(path.join(root, 'assets/main.js'), 'utf8'),
  context,
);

assert.equal(elements['main-nav'].hidden, true);
assert.equal(moreServices.open, true, 'All services visible on small screens');
serviceMedia.matches = false;
serviceMedia.change();
assert.equal(moreServices.open, false, 'Desktop starts collapsed');
serviceMedia.matches = true;
serviceMedia.change();
assert.equal(moreServices.open, true, 'Resize restores all services');
menu.events.click();
assert.equal(elements['main-nav'].hidden, false);
assert.equal(menu.attrs['aria-expanded'], 'true');

// Exercise native delivery configuration and validation without network traffic.
const contactCode = await readFile(path.join(root, 'assets/contact.js'), 'utf8');
assert.match(html, /action="https:\/\/formsubmit\.co\/ovisu666@gmail\.com" method="POST"/);
assert.doesNotMatch(html, /_captcha|mailto:|email-preview/);
assert.match(html, /name="_honey"/);
assert.match(html, /name="email"[^>]*type="email"/);

function contactHarness(href, email = 'ovisu666@gmail.com') {
  const inputs = Object.fromEntries(Object.entries({
    name: '  João & Maria  ', company: ' Hospital A/B ', email: ' teste@example.com ',
    interest: 'Estruturação de UTI', _subject: '', _next: '', _honey: '',
  }).map(([key, value]) => [key, { value }]));
  const form = makeElement();
  form.elements = { namedItem: (name) => inputs[name] };
  form.reportValidity = () => Boolean(inputs.name.value && inputs.company.value && inputs.email.value.includes('@'));
  const button = makeElement();
  const status = makeElement();
  const handlers = {};
  const page = {
    location: new URL(href),
    MEDICALT_CONFIG: { contactEmail: email, contactSubject: 'Parceria hospitalar — Medicalt' },
    addEventListener: (name, handler) => { handlers[name] = handler; },
  };
  vm.runInNewContext(contactCode, {
    window: page, URL,
    document: { getElementById: (id) => ({ 'contact-form': form, 'contact-submit': button, 'form-message': status })[id] },
  });
  return { form, button, status, inputs, handlers, send() {
    let blocked = false;
    form.events.submit({ preventDefault() { blocked = true; } });
    return blocked;
  } };
}

const delivery = contactHarness('https://ovisu.github.io/medicalt-prototipo/#mt-contact');
assert.equal(delivery.form.action, 'https://formsubmit.co/ovisu666@gmail.com');
assert.equal(delivery.inputs._next.value, 'https://ovisu.github.io/medicalt-prototipo/obrigado.html');
assert.equal(delivery.inputs._subject.value, 'Parceria hospitalar — Medicalt');
assert.equal(delivery.button.disabled, false);
assert.equal(delivery.send(), false, 'Valid data must allow native POST');
assert.equal(delivery.inputs.name.value, 'João & Maria');
assert.equal(delivery.inputs.company.value, 'Hospital A/B');
assert.equal(delivery.button.disabled, true);
assert.equal(delivery.form.attrs['aria-busy'], 'true');
assert.doesNotMatch(delivery.status.textContent, /Mensagem enviada/);
assert.equal(delivery.send(), true, 'Block duplicate submissions');
delivery.handlers.pageshow();
assert.equal(delivery.button.disabled, false, 'Back must restore submit button');
assert.equal(delivery.status.textContent, '');
delivery.inputs.name.value = '   ';
assert.equal(delivery.send(), true, 'Block whitespace-only required fields');
assert.equal(delivery.button.disabled, false);
delivery.inputs.name.value = 'Teste';
delivery.inputs._honey.value = 'spam';
assert.equal(delivery.send(), true, 'Honeypot prevents automated submissions');
const local = contactHarness('http://127.0.0.1:4174/index.html#mt-contact');
assert.equal(local.inputs._next.value, 'http://127.0.0.1:4174/obrigado.html');
const broken = contactHarness('https://example.com', 'wrong?email');
assert.equal(broken.button.disabled, true);
assert.equal(broken.send(), true);
const disk = contactHarness('file:///site/index.html');
assert.equal(disk.button.disabled, true);
assert.equal(disk.send(), true);
const thanks = await readFile(path.join(root, 'obrigado.html'), 'utf8');
assert.match(thanks, /href="index.html"/);
assert.match(thanks, /name="robots" content="noindex"/);

console.log('PASS: HTML, assets, syntax, navigation, FormSubmit configuration, validation, duplicate prevention and Back recovery.');
console.log('No network submissions were made. Provider activation, CAPTCHA and inbox delivery require an end-to-end check.');
