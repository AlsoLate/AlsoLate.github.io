/* ============ 阅读页 ============ */
(async function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  const slug = new URLSearchParams(location.search).get("slug");
  const root = document.getElementById("articleRoot");

  if (!slug) {
    root.innerHTML = '<div class="dropdown-empty" style="padding:60px">缺少文章参数。</div>';
    return;
  }

  try {
    const a = await Site.fetchJson("data/articles.json");
    const art = a.articles.find((x) => x.slug === slug);

    if (!art) {
      root.innerHTML = '<div class="dropdown-empty" style="padding:60px">没有找到这篇。</div>';
      document.getElementById("comments").style.display = "none";
      return;
    }

    let md = "";
    const mdRes = await fetch("content/" + slug + ".md");
    if (mdRes.ok) {
      const text = await mdRes.text();
      md = window.marked ? marked.parse(text) : "";
    }
    document.title = art.title + " · 亦迟";

    const tags = (art.tags || [])
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");

    root.innerHTML = `
      <header class="reading-head">
        <div class="cat">${art.category || "随笔"}</div>
        <h1>${art.title}</h1>
        <div class="meta">
          <span>亦迟</span><span class="sep">·</span>
          <span>${art.date || ""}</span><span class="sep">·</span>
          <span>${art.views || "—"} 次翻页</span>
        </div>
      </header>
      ${art.cover ? `<div class="reading-cover reveal"><img src="${art.cover}" alt="${art.title}"></div>` : ""}
      <div class="markdown-body reveal" style="animation-delay:.1s">
        ${md || "<p>正文还没有打磨好。</p>"}
        <div class="reading-tags">${tags}</div>
      </div>
      <div class="reading-foot"><a href="articles.html">← 回到装订册</a></div>
    `;

    if (window._hljs && window._hljs.highlightElement) {
      document.querySelectorAll(".markdown-body pre code").forEach((el) => {
        try { window._hljs.highlightElement(el); } catch (e) {}
      });
    }

    mountGiscus();
  } catch (e) {
    root.innerHTML = '<div class="dropdown-empty" style="padding:60px">翻页失败了。</div>';
  }

  function mountGiscus() {
    // ===== 待配置：替换为你的 GitHub 仓库信息 =====
    const REPO = "alsolate/alsolate.github.io";
    const REPO_ID = "";        // 仓库 ID
    const CATEGORY = "General";
    const CATEGORY_ID = "";    // 分类 ID

    const ph = document.getElementById("giscus");
    if (!REPO_ID || !CATEGORY_ID) {
      ph.innerHTML =
        '这里还空着——评论需要你到 GitHub 开启 Giscus 后才会出现。<br>' +
        '<a href="https://giscus.app" target="_blank" rel="noopener" style="color:var(--accent);font-size:14px">去开启 ›</a>';
      return;
    }

    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.setAttribute("data-repo", REPO);
    s.setAttribute("data-repo-id", REPO_ID);
    s.setAttribute("data-category", CATEGORY);
    s.setAttribute("data-category-id", CATEGORY_ID);
    s.setAttribute("data-mapping", "specific");
    s.setAttribute("data-term", slug);
    s.setAttribute("data-reactions-enabled", "1");
    s.setAttribute("data-input-position", "top");
    s.setAttribute("data-theme", document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    s.setAttribute("data-lang", "zh-CN");
    s.setAttribute("crossorigin", "anonymous");
    s.async = true;
    ph.textContent = "";
    ph.appendChild(s);

    const toggle = document.querySelector(".theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        const iframe = document.querySelector("iframe.giscus-frame");
        if (iframe) iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, "https://giscus.app");
      });
    }
  }
})();