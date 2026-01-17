document.addEventListener("DOMContentLoaded", function () {
  if (typeof window.$ === "undefined" && typeof window.JustifiedGallery === "undefined") {
    // using vanilla JustifiedGallery from CDN, globally exposed
  }

  var roots = document.querySelectorAll("[data-jg]");
  if (!roots.length || typeof window.JustifiedGallery === "undefined") return;

  roots.forEach(function (el) {
    new window.JustifiedGallery(el, {
      rowHeight: 260,
      lastRow: "center",
      margin: 16,
    });
  });
});
