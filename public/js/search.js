(function () {
  var overlay, inputEl, resultsEl;
  var indexLoaded = false;
  var pages = [];

  function ensureElements() {
    if (!overlay) {
      overlay = document.querySelector("[data-search-overlay]");
    }
    if (!inputEl && overlay) {
      inputEl = overlay.querySelector("[data-search-input]");
    }
    if (!resultsEl && overlay) {
      resultsEl = overlay.querySelector("[data-search-results]");
    }
  }

  function loadIndex() {
    if (indexLoaded) return;
    indexLoaded = true;

    fetch("/index.json")
      .then(function (r) {
        if (!r.ok) throw new Error("index.json not found");
        return r.json();
      })
      .then(function (data) {
        pages = (data && data.pages) || [];
      })
      .catch(function () {
        pages = [];
      });
  }

  function openOverlay() {
    ensureElements();
    if (!overlay) return;

    overlay.classList.remove("search-overlay");
    overlay.classList.add("search-overlay--open");
    loadIndex();

    if (inputEl) {
      setTimeout(function () {
        inputEl.focus();
      }, 20);
    }
  }

  function closeOverlay() {
    ensureElements();
    if (!overlay) return;

    if (overlay.classList.contains("search-overlay--closing")) return;

    overlay.classList.add("search-overlay--closing");

    setTimeout(function () {
      overlay.classList.remove("search-overlay--open");
      overlay.classList.remove("search-overlay--closing");
      overlay.classList.add("search-overlay");

      if (inputEl) inputEl.value = "";

      if (resultsEl) {
        resultsEl.innerHTML =
          '<div class="search-empty-state">' +
          '<div class="search-empty-icon"><i class="fa-solid fa-magnifying-glass text-[1rem]"></i></div>' +
          '<p class="search-empty-title">Start searching</p>' +
          '<p class="search-empty-subtitle">Enter keywords to search articles.</p>' +
          "</div>";
      }
    }, 180);
  }

  function filterPages(query) {
    if (!pages.length) return [];
    var q = (query || "").toLowerCase().trim();
    if (!q) return [];
    return pages
      .filter(function (p) {
        var t = (p.title || "").toLowerCase();
        var s = (p.summary || "").toLowerCase();
        return t.indexOf(q) !== -1 || s.indexOf(q) !== -1;
      })
      .slice(0, 20);
  }

  function highlightText(text, query) {
    if (!query) return text;
    var regex = new RegExp("(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function getSectionIcon(section) {
    var icons = {
      blog: "fa-regular fa-note-sticky",
      projects: "fa-regular fa-folder-open",
      posts: "fa-regular fa-note-sticky",
    };
    return icons[section.toLowerCase()] || "fa-regular fa-file";
  }

  function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  function renderResults(query) {
    ensureElements();
    if (!resultsEl) return;

    var q = (query || "").trim();
    if (!q) {
      resultsEl.innerHTML =
        '<div class="search-empty-state">' +
        '<div class="search-empty-icon"><i class="fa-solid fa-magnifying-glass text-[1rem]"></i></div>' +
        '<p class="search-empty-title">Start searching</p>' +
        '<p class="search-empty-subtitle">Enter keywords to search articles.</p>' +
        "</div>";
      return;
    }

    var matches = filterPages(q);
    if (!matches.length) {
      resultsEl.innerHTML =
        '<div class="search-empty-state">' +
        '<div class="search-empty-icon"><i class="fa-solid fa-circle-exclamation text-[1rem]"></i></div>' +
        '<p class="search-empty-title">No results found</p>' +
        '<p class="search-empty-subtitle">Try different keywords or check your spelling.</p>' +
        "</div>";
      return;
    }

    var html = matches
      .map(function (p, index) {
        var title = highlightText(p.title || "Untitled", q);
        var section = p.section || "";
        var summary = truncateText(p.summary || "", 120);
        var highlightedSummary = highlightText(summary, q);
        var icon = getSectionIcon(section);
        var date = p.date ? new Date(p.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric"
        }) : "";

        return (
          '<a href="' +
          p.permalink +
          '" class="search-result-item" data-result-index="' +
          index +
          '">' +
          '<div class="search-result-header">' +
          '<i class="' + icon + ' search-result-icon"></i>' +
          '<div class="search-result-info">' +
          '<div class="search-result-title">' +
          title +
          "</div>" +
          '<div class="search-result-meta">' +
          (section ? '<span class="search-result-section">' + section + "</span>" : "") +
          (date ? '<span class="search-result-date">' + date + "</span>" : "") +
          "</div>" +
          "</div>" +
          "</div>" +
          (highlightedSummary ? '<div class="search-result-summary">' + highlightedSummary + "</div>" : "") +
          "</a>"
        );
      })
      .join("");

    resultsEl.innerHTML = html;

    // Add keyboard navigation
    addKeyboardNavigation();
  }

  var selectedIndex = -1;

  function addKeyboardNavigation() {
    ensureElements();
    if (!inputEl) return;

    var items = resultsEl.querySelectorAll(".search-result-item");

    inputEl.addEventListener("keydown", function(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        updateSelection(items);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection(items);
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        items[selectedIndex].click();
      }
    });
  }

  function updateSelection(items) {
    items.forEach(function(item, index) {
      if (index === selectedIndex) {
        item.classList.add("search-result-item--selected");
        item.scrollIntoView({ block: "nearest", behavior: "smooth" });
      } else {
        item.classList.remove("search-result-item--selected");
      }
    });
  }

  function initSearch() {
    ensureElements();
    if (!overlay) return;

    // Close and ESC
    overlay.querySelectorAll("[data-search-close]").forEach(function (el) {
      el.addEventListener("click", closeOverlay);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeOverlay();
    });

    // Typing
    if (inputEl) {
      inputEl.addEventListener("input", function (e) {
        renderResults(e.target.value || "");
      });
    }

    // Ctrl/Cmd + K to open
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openOverlay();
      }
    });

    // Expose global API for inline onclick
    window.MinimalSearch = {
      open: openOverlay,
      close: closeOverlay,
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }
})();
