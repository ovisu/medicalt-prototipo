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

for (const name of ['config.js', 'main.js']) {
  const check = spawnSync(
    process.execPath,
    ['--check', path.join(root, 'assets', name)],
    { encoding: 'utf8' },
  );
  assert.equal(check.status, 0, check.stderr);
}

// Exercise contact preparation without opening an e-mail app or sending data.
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

elements['contact-form'].events.submit({ preventDefault() {} });

const mail = new URL(elements['open-email'].href);
assert.equal(elements['contact-submit'].textContent, 'Revisar mensagem ↗');
assert.match(elements['contact-status'].textContent, /Você confirma o envio por lá\./);
assert.match(elements['contact-status'].textContent, /Não inclua dados de pacientes\./);
assert.match(elements['email-body'].textContent, /Olá, equipe Medicalt\./);
assert.match(elements['email-body'].textContent, /Instituição:/);
assert.equal(elements['email-preview'].hidden, false);
assert.equal(windowMock.location.href, '', 'Review must not open mail automatically');
assert.equal(mail.protocol, 'mailto:');
assert.equal(mail.pathname, windowMock.MEDICALT_CONFIG.contactEmail);
assert.match(mail.searchParams.get('body'), /João & Maria/);
assert.match(mail.searchParams.get('body'), /Hospital A\/B/);
assert.equal(mail.searchParams.size, 2, 'Fields must not inject URL parameters');

windowMock.location.href = '';
fields.name = '   ';
elements['contact-form'].events.submit({ preventDefault() {} });
assert.equal(windowMock.location.href, '', 'Whitespace-only name must not proceed');
assert.equal(elements['email-preview'].hidden, true);

fields.name = 'Teste';
fields.company = '<script>alert(1)</script> & assunto=outro';
elements['contact-form'].events.submit({ preventDefault() {} });
assert.match(elements['email-body'].textContent, /<script>/);
const reviewed = new URL(elements['open-email'].href);
assert.equal(reviewed.searchParams.size, 2);
assert.match(reviewed.searchParams.get('body'), /assunto=outro/);
elements['contact-form'].events.input();
assert.equal(elements['email-preview'].hidden, true, 'Editing invalidates old preview');

console.log(
  [
    'PASS: HTML structure, local assets, anchors, image dimensions,',
    'JavaScript syntax, mobile menu state and safely encoded contact flow.',
  ].join(' '),
);
console.log(
  'This check does not replace visual browser, screen-reader or e-mail delivery testing.',
);
