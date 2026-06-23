function setupAccordion() {
  var sidebar = document.querySelector(".md-sidebar--primary");
  if (!sidebar) return;

  // 이미 등록됐으면 스킵
  if (sidebar.dataset.accordion) return;
  sidebar.dataset.accordion = "1";

  sidebar.addEventListener("change", function (e) {
    var toggle = e.target;
    if (toggle.type !== "checkbox") return;

    // 최상위 섹션 토글인지 확인
    var item = toggle.parentElement;
    if (!item || !item.classList.contains("md-nav__item")) return;
    var list = item.parentElement;
    if (!list) return;

    // 같은 레벨의 다른 토글 닫기
    if (toggle.checked) {
      list.querySelectorAll(":scope > .md-nav__item > input[type='checkbox']").forEach(function (t) {
        if (t !== toggle) t.checked = false;
      });
    }
  });
}

// 초기 실행
document.addEventListener("DOMContentLoaded", setupAccordion);

// MkDocs Material SPA 네비게이션 대응
document$.subscribe(function () {
  setTimeout(setupAccordion, 100);
});
