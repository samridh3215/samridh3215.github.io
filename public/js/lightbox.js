document.addEventListener("DOMContentLoaded", function () {
  if (typeof GLightbox === "undefined") return;

  GLightbox({
    selector: ".glightbox",
    loop: true,
    touchNavigation: true,
    zoomable: true,
    draggable: true,
  });
});
