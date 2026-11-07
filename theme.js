(function () {
    const STORAGE_KEY = 'ela-theme';
    const root = document.documentElement;

    function readStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
    }

    function storeTheme(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch (error) {
            return;
        }
    }

    function updateToggle(theme) {
        const button = document.getElementById('themeToggle');
        if (!button) return;
        const isDark = theme === 'dark';
        button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        button.setAttribute('title', isDark ? 'Light mode' : 'Dark mode');
    }

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        updateToggle(theme);
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(readStoredTheme() || (prefersDark ? 'dark' : 'light'));

    document.addEventListener('DOMContentLoaded', function () {
        const button = document.getElementById('themeToggle');
        if (!button) return;
        updateToggle(root.getAttribute('data-theme'));
        button.addEventListener('click', function () {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(next);
            storeTheme(next);
        });
    });
})();