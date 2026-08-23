/* ============ 项目页：作品列表 ============ */
(async function () {
  document.getElementById("year").textContent = new Date().getFullYear();
  const list = document.getElementById("projectList");

  try {
    const data = await Site.fetchJson("data/projects.json");
    list.innerHTML = (data.projects || [])
      .map(
        (it, i) => `
      <a class="pv-row" href="${it.url}" target="_blank" rel="noopener">
        <div class="pv-media">${it.cover ? `<img src="${it.cover}" alt="${it.title}" loading="lazy">` : ""}</div>
        <div class="pv-info">
          <div class="pv-head">
            <span class="pv-num">${String(i + 1).padStart(2, "0")}</span>
            <h3 class="pv-title">${it.title}</h3>
            ${it.tag ? `<span class="pv-tag">${it.tag}</span>` : ""}
          </div>
          <p class="pv-desc">${it.desc || ""}</p>
          <div class="pv-tech">${(it.tech || []).map((t) => `<span>${t}</span>`).join("")}</div>
        </div>
      </a>`
      )
      .join("");
  } catch (e) {
    list.innerHTML = '<div class="pv-desc" style="padding:40px">清单暂时拿不出来，请稍后再试。</div>';
  }
})();