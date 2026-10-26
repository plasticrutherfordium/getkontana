// SPDX-License-Identifier: MPL-2.0
(function () {
  function updateThemeLabels() {
    const light = document.documentElement.dataset.theme === 'light';
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', light ? button.dataset.darkLabel : button.dataset.lightLabel);
      button.setAttribute('aria-pressed', String(light));
    });
  }
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', () => window.__ktToggleTheme()));
  document.querySelectorAll('[data-language-link]').forEach((link) => link.addEventListener('click', () => {
    try { localStorage.setItem('kt-language', link.dataset.languageLink); } catch (_) {}
  }));
  document.addEventListener('click', (event) => {
    document.querySelectorAll('.language-menu[open]').forEach((menu) => { if (!menu.contains(event.target)) menu.open = false; });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.language-menu[open]').forEach((menu) => { menu.open = false; menu.querySelector('summary').focus(); });
  });
  window.addEventListener('kontana:theme', updateThemeLabels);
  updateThemeLabels();
}());
