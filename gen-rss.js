#!/usr/bin/env node
/**
 * 自动生成 feed.xml
 * 用法:
 *   node gen-rss.js
 * 会自动读取 data/articles.json 和 content/*.md，
 * 生成含完整正文的 RSS 2.0 文件到 feed.xml
 */
"use strict";

const fs = require("fs");
const path = require("path");

const BASE = "https://alsolate.github.io";
const SITE_TITLE = "亦迟";
const SITE_DESC = "亦迟（AlsoLate）的个人博客：记录技术、设计与生活的片段。";
const LANG = "zh-CN";

/* ---------- 工具 ---------- */

function escXml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// RFC 822 时间，例如 "2026-08-20" -> "Thu, 20 Aug 2026 00:00:00 GMT"
function toRfc822(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  if (isNaN(d.getTime())) return new Date().toUTCString();
  return d.toUTCString();
}

/* 轻量 Markdown -> HTML（覆盖本博客用到的子集） */
function mdToHtml(md) {
  const lines = String(md || "").split(/\r?\n/);
  let html = "";
  let inCode = false;
  let listStack = null; // 'ul' | 'ol'
  let para = [];

  const closeList = () => {
    if (listStack) { html += `</${listStack}>`; listStack = null; }
  };
  const flushPara = () => {
    if (para.length) {
      html += "<p>" + inline(para.join(" ")) + "</p>\n";
      para = [];
    }
  };

  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g, (m, c) => `<code>${escXml(c)}</code>`)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  for (const raw of lines) {
    const line = raw.trim();

    if (line.startsWith("```")) {
      if (!inCode) { closeList(); flushPara(); html += "<pre><code>"; inCode = true; }
      else { html += "</code></pre>\n"; inCode = false; }
      continue;
    }
    if (inCode) { html += escXml(raw) + "\n"; continue; }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      closeList(); flushPara();
      // 跳过最顶层 #（与文章标题重复）
      if (level > 1) html += `<h${level}>${inline(line.replace(/^#+\s*/, ""))}</h${level}>\n`;
      continue;
    }
    if (/^> ?/.test(line)) {
      closeList(); flushPara();
      html += "<blockquote>" + inline(line.replace(/^>\s?/, "")) + "</blockquote>\n";
      continue;
    }
    if (/^[-*] /.test(line)) {
      flushPara();
      if (listStack !== "ul") { closeList(); listStack = "ul"; html += "<ul>\n"; }
      html += "<li>" + inline(line.replace(/^[-*]\s*/, "")) + "</li>\n";
      continue;
    }
    if (/^\d+\. /.test(line)) {
      flushPara();
      if (listStack !== "ol") { closeList(); listStack = "ol"; html += "<ol>\n"; }
      html += "<li>" + inline(line.replace(/^\d+\.\s*/, "")) + "</li>\n";
      continue;
    }
    if (!line) { closeList(); flushPara(); continue; }
    closeList();
    para.push(line);
  }
  closeList(); flushPara();
  return html.trim();
}

/* ---------- 主流程 ---------- */

function main() {
  const dataPath = path.join(__dirname, "data", "articles.json");
  const contentDir = path.join(__dirname, "content");

  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const articles = (JSON.parse(JSON.stringify(data)).articles || []).slice().reverse(); // 新的在前

  const items = articles.map((a) => {
    const link = `${BASE}/article.html?slug=${encodeURIComponent(a.slug)}`;
    let content = a.desc || "";
    const mdFile = path.join(contentDir, `${a.slug}.md`);
    if (fs.existsSync(mdFile)) {
      const md = fs.readFileSync(mdFile, "utf8");
      content = mdToHtml(md);
    }
    const tags = (a.tags || []).map((t) => `    <category>${escXml(t)}</category>`).join("\n");
    return `    <item>
      <title>${escXml(a.title)}</title>
      <link>${escXml(link)}</link>
      <guid isPermaLink="false">${escXml(a.slug)}</guid>
      <pubDate>${toRfc822(a.date)}</pubDate>
      <category>${escXml(a.category || "随笔")}</category>
${tags ? tags + "\n" : ""}      <description>${escXml(a.desc || "")}</description>
      <content:encoded><![CDATA[${content}]]></content:encoded>
    </item>`;
  });

  const now = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escXml(SITE_TITLE)}</title>
    <link>${BASE}/</link>
    <description>${escXml(SITE_DESC)}</description>
    <language>${LANG}</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${now}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>
`;

  fs.writeFileSync(path.join(__dirname, "feed.xml"), xml, "utf8");
  console.log(`✓ feed.xml 已生成（共 ${articles.length} 篇文章）`);
}

main();