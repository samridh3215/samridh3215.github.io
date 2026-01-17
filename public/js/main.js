(function () {
  var STORAGE_KEY = "theme";
  /* ---------- Theme ---------- */

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  function getSystemTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    var isDark = theme === "dark";
    var lightIcons = document.querySelectorAll("[data-theme-icon-light]");
    var darkIcons = document.querySelectorAll("[data-theme-icon-dark]");

    lightIcons.forEach(function (el) {
      el.style.display = isDark ? "" : "none";
    });
    darkIcons.forEach(function (el) {
      el.style.display = isDark ? "none" : "";
    });
  }

  function initThemeFromDOM() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") {
      applyTheme(attr);
      return;
    }
    var stored = getStoredTheme();
    applyTheme(stored || getSystemTheme());
  }

  function toggleTheme() {
    var current =
      document.documentElement.getAttribute("data-theme") || "light";
    var next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    storeTheme(next);
  }

  function initThemeToggle() {
    var btns = document.querySelectorAll("[data-theme-toggle]");
    if (!btns.length) return;
    btns.forEach(function (btn) {
      btn.addEventListener("click", toggleTheme);
    });
  }

  /* ---------- Mobile nav ---------- */

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) return;

    var open = false;
    function setOpen(next) {
      open = next;
      nav.style.display = open ? "block" : "none";
    }

    toggle.addEventListener("click", function () {
      setOpen(!open);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setOpen(false);
    });
  }

  /* ---------- Dock ---------- */

  function initDock() {
    var dock = document.querySelector("[data-dock]");
    if (!dock) return;

    var toggle = dock.querySelector("[data-dock-toggle]");
    var backTop = dock.querySelector('[data-dock-action="top"]');
    var backBtn = dock.querySelector('[data-dock-action="back"]');
    var open = false;

    function setOpen(next) {
      open = next;
      dock.classList.toggle("dock--open", open);
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        setOpen(!open);
      });
    }

    if (backTop) {
      backTop.addEventListener("click", function (e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.history.back();
      });
    }
  }

  /* ---------- Init ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    initThemeFromDOM();
    initThemeToggle();
    initMobileNav();
    initDock();
  });
})();
