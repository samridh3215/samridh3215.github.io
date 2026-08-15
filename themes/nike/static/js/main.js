(function () {
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

  /* ---------- Table of contents ---------- */

  function initToc() {
    var tocWrapper = document.querySelector(".toc-wrapper");
    var tocToggle = document.querySelector(".toc-toggle");
    var tocNav = document.querySelector(".toc-nav");
    var tocLinks = document.querySelectorAll(".toc-nav a");

    if (!tocWrapper || !tocNav) return;

    if (tocToggle) {
      tocToggle.addEventListener("click", function () {
        tocWrapper.classList.toggle("collapsed");
      });
    }

    tocLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var targetId = this.getAttribute("href");
        var targetElement = document.querySelector(targetId);

        if (targetElement) {
          var yOffset = -80;
          var y =
            targetElement.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
          history.pushState(null, null, targetId);
        }
      });
    });

    var headings = document.querySelectorAll(
      ".markdown-body h1[id], .markdown-body h2[id], .markdown-body h3[id], .markdown-body h4[id], .markdown-body h5[id], .markdown-body h6[id]"
    );

    var activeHeading = null;
    var observer = new IntersectionObserver(
      function (entries) {
        var intersecting = [];
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            intersecting.push({
              element: entry.target,
              top: entry.boundingClientRect.top,
            });
          }
        });

        if (intersecting.length > 0) {
          intersecting.sort(function (a, b) {
            return Math.abs(a.top) - Math.abs(b.top);
          });

          var id = intersecting[0].element.getAttribute("id");

          if (id && id !== activeHeading) {
            activeHeading = id;
            var tocLink = document.querySelector('.toc-nav a[href="#' + id + '"]');

            if (tocLink) {
              tocLinks.forEach(function (link) {
                link.classList.remove("active");
              });
              tocLink.classList.add("active");
            }
          }
        }
      },
      { rootMargin: "-80px 0px -80%", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    headings.forEach(function (heading) {
      observer.observe(heading);
    });

    if (tocLinks.length > 0) {
      tocLinks[0].classList.add("active");
      activeHeading = tocLinks[0].getAttribute("href").substring(1);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initToc();
  });
})();
