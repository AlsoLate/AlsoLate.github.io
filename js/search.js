/* ============ Live search across articles & projects ============ */
(function () {
  let pool = [];

  async function loadPool() {
    const [a, p] = await Promise.all([
      Site.fetchJson(Site.dataUrl),
      Site.fetchJson("data/projects.json"),
    ]);
    const articles = a.articles.map((x) => ({
      ...x,
      kind: "文章",
      url: "article.html?slug=" + encodeURIComponent(x.slug),
      src: x.cover,
      search: (x.title + " " + x.desc + " " + (x.tags || []).join(" ")).toLowerCase(),
    }));
    const projects = p.projects.map((x) => ({
      ...x,
      kind: "项目",
      url: x.url,
      src: x.cover,
      search: (x.title + " " + x.desc + " " + (x.tech || []).join(" ")).toLowerCase(),
    }));
    pool = articles.concat(projects);
  }

  function render(items, box) {
    box.innerHTML = "";
    if (!items.length) {
      box.innerHTML = '<div class="dropdown-empty">没有找到相关结果</div>';
      return;
    }
    items.forEach((item) => {
      const tag = item.kind === "文章" ? (item.category || "文章") : (item.tag || "项目");
      const el = document.createElement("a");
      el.className = "dropdown-item";
      el.href = item.url;
      el.innerHTML = `
        <img class="dropdown-thumb" src="${item.src}" alt="" loading="lazy">
        <div>
          <div class="dropdown-title">${item.title}</div>
          <div class="dropdown-meta">${tag} · ${item.kind}${item.date ? " · " + item.date : ""}</div>
        </div>`;
      box.appendChild(el);
    });
  }

  window.initSiteSearch = function (inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    let timer;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(async function () {
        const q = input.value.trim().toLowerCase();
        if (!q) { close(); return; }
        try {
          if (!pool.length) await loadPool();
          const hits = pool
            .filter((x) => x.search.includes(q))
            .slice(0, 6);
          render(hits, dropdown);
          dropdown.classList.add("open");
        } catch (e) {
          close();
        }
      }, 180);
    });

    function close() {
      dropdown.classList.remove("open");
    }

    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  };
})();