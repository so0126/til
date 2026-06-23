document.addEventListener("DOMContentLoaded", function () {
  function initAccordion() {
    var toggles = document.querySelectorAll(
      ".md-nav--primary > .md-nav__list > .md-nav__item--section > input.md-nav__toggle"
    );

    toggles.forEach(function (toggle) {
      toggle.addEventListener("change", function () {
        if (this.checked) {
          toggles.forEach(function (other) {
            if (other !== toggle) other.checked = false;
          });
        }
      });
    });
  }

  initAccordion();

  // SPA 네비게이션 후에도 재적용
  var observer = new MutationObserver(function () {
    initAccordion();
  });
  var sidebar = document.querySelector(".md-sidebar--primary");
  if (sidebar) {
    observer.observe(sidebar, { childList: true, subtree: true });
  }
});
