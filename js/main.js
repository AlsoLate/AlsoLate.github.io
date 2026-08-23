/* ============ 主题切换 ============ */
(function () {
  const stored = localStorage.getItem("alsolate-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", stored || (prefersDark ? "dark" : "light"));

  const btn = document.querySelector(".theme-toggle");
  if (btn) {
    const MOON = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    const setState = () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      btn.innerHTML = '<span class="knob">' + MOON + "</span>";
      btn.dataset.tip = dark ? "切换至浅色模式" : "切换至深色模式";
    };
    setState();
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("alsolate-theme", next);
      setState();
    });
  }
})();

/* ============ 通用工具 ============ */
const Site = {
  dataUrl: "data/articles.json",
  author: "亦迟",

  async fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("加载 " + url + " 失败");
    return res.json();
  },
};

/* 首页条目行（文章 / 项目共用） */
Site.homeRow = function (item, type) {
  const isArticle = type === "article";
  const url = isArticle
    ? "article.html?slug=" + encodeURIComponent(item.slug)
    : (item.url || "javascript:void(0)");
  const meta = isArticle
    ? `<span>${item.date || ""}</span><span class="tag">${item.category || "随笔"}</span>`
    : `<span>${item.tag || "作品"}</span>`;
  return `
    <li><a class="home-row" href="${url}">
      <div class="l-meta">${meta}</div>
      <div class="l-title">${item.title}</div>
      <div class="l-desc">${item.desc || ""}</div>
    </a></li>`;
};