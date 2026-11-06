/* Apply the saved theme before styles paint to avoid a light/dark flash. */
(function () {
  const stored = localStorage.getItem('ela-theme');
  const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (preferred ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  function addToggle() {
    if (document.querySelector('.theme-toggle')) return;
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    button.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
    button.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun" aria-hidden="true"></i><span>Light</span>'
      : '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark</span>';
    button.addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ela-theme', next);
      button.setAttribute('aria-label', next === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('title', next === 'dark' ? 'Light mode' : 'Dark mode');
      button.innerHTML = next === 'dark'
        ? '<i class="fas fa-sun" aria-hidden="true"></i><span>Light</span>'
        : '<i class="fas fa-moon" aria-hidden="true"></i><span>Dark</span>';
    });
    document.body.appendChild(button);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addToggle);
  else addToggle();
})();
