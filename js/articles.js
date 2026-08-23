/* ============ 文字页：时间线 + 分类筛选 ============ */
(function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  const timeline = document.getElementById("timeline");
  const bar = document.getElementById("filterBar");
  let all = [];

  const render = (list) => {
    timeline.innerHTML = list
      .map(
        (it) => `
      <a class="tl-item" href="article.html?slug=${encodeURIComponent(it.slug)}">
        <span class="tl-dot"></span>
        <div class="tl-date">${it.date || ""}</div>
        <div class="tl-title">${it.title}</div>
        <div class="tl-desc">${it.desc || ""}</div>
        <div class="tl-meta">
          <span class="pill">${it.category || "随笔"}</span>
          ${(it.tags || []).map((t) => `<span class="pill" style="background:var(--plum-soft);color:var(--plum)">${t}</span>`).join("")}
        </div>
      </a>`
      )
      .join("");
  };

  const apply = (cat) => {
    const filtered = cat === "全部" ? all : all.filter((x) => x.category === cat);
    render(filtered);
  };

  (async () => {
    try {
      const data = await Site.fetchJson("data/articles.json");
      all = data.articles.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      const cats = ["全部", ...new Set(all.map((x) => x.category).filter(Boolean))];
      bar.innerHTML = "";
      cats.forEach((c) => {
        const b = document.createElement("button");
        b.className = "filter-chip" + (c === "全部" ? " active" : "");
        b.dataset.cat = c;
        b.textContent = c;
        bar.appendChild(b);
      });
      apply("全部");
    } catch (e) {
      timeline.innerHTML = '<div class="tl-desc" style="padding:40px">这册书暂时打不开，请稍后再试。</div>';
    }
  })();

  bar.addEventListener("click", (e) => {
    const chip = e.target.closest(".filter-chip");
    if (!chip) return;
    bar.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    apply(chip.dataset.cat);
  });

  if (typeof initSiteSearch === "function") initSiteSearch("searchInput", "searchDropdown");
})();