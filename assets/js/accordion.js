function setupAccordion() {
  document.addEventListener("click", function (e) {
    // 클릭된 요소가 사이드바 최상위 섹션 label인지 확인
    var label = e.target.closest(
      ".md-nav--primary > .md-nav__list > .md-nav__item--nested > label.md-nav__link"
    );
    if (!label) return;

    var clickedToggle = label.parentElement.querySelector("input[type='checkbox']");

    // 클릭 처리가 끝난 뒤 나머지 섹션 닫기
    setTimeout(function () {
      if (!clickedToggle || !clickedToggle.checked) return;
      document
        .querySelectorAll(
          ".md-nav--primary > .md-nav__list > .md-nav__item--nested > input[type='checkbox']"
        )
        .forEach(function (t) {
          if (t !== clickedToggle) t.checked = false;
        });
    }, 0);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupAccordion);
} else {
  setupAccordion();
}
