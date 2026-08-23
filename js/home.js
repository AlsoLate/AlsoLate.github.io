/* ============ 主页：拼音打字效果（yi → yichi → 亦迟） ============ */
(function () {
  const el = document.getElementById("typed");
  if (!el) return;
  const caret = document.querySelector(".caret");
  el.textContent = "";
  // 还原成目标汉字前，先把拼音逐键打出来
  const PINYIN = "yichi";
  const FINAL = "亦迟";
  let pi = 0;

  (function typePinyin() {
    if (pi <= PINYIN.length) {
      el.textContent = PINYIN.slice(0, pi);
      if (pi === PINYIN.length) {
        setTimeout(convert, 260);
        return;
      }
      pi++;
      setTimeout(typePinyin, 80);
    }
  })();

  function convert() {
    el.textContent = FINAL;
    setTimeout(() => caret && caret.classList.add("hide"), 1400);
  }
})();

(async function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  async function load(list, containerId, type, count) {
    const url = type === "article" ? "data/articles.json" : "data/projects.json";
    const key = type === "article" ? "articles" : "projects";
    try {
      const data = await Site.fetchJson(url);
      document.getElementById(containerId).innerHTML =
        (data[key] || []).slice(0, count).map((x) => Site.homeRow(x, type)).join("");
    } catch (e) {
      document.getElementById(containerId).innerHTML =
        '<li><a class="home-row"><div class="l-desc">加载失败。</div></a></li>';
    }
  }

  await load(null, "homeArticles", "article", 3);
  await load(null, "homeProjects", "project", 3);
})();