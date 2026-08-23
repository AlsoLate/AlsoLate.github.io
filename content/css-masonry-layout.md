# 用纯 CSS 实现小红书式瀑布流布局

> 不用任何框架，只靠几行 attribute，就能做出高度错落的信息流排版。

小红书、Pinterest 那种"图片在前、高度不一、像刷墙一样"的排版，很多同学以为需要 JS 计算。其实用 CSS 的多列布局就能轻松搞定。

## 核心思路

最优雅的方案是 `columns` 多列布局：

```css
.waterfall {
  columns: 3;
  column-gap: 20px;
}
```

然后让每个卡片**不被打断**：

```css
.card {
  break-inside: avoid;
}
```

就这么简单。浏览器会自动把卡片分配到每一列里，形成天然的瀑布流。

## 响应式列数

想要在不同屏幕上显示不同的列数，用媒体查询即可：

```css
.waterfall { columns: 1; }                      /* 手机 */
@media (min-width: 640px)  { .waterfall { columns: 2; } }
@media (min-width: 960px)  { .waterfall { columns: 3; } }
@media (min-width: 1280px) { .waterfall { columns: 4; } }
```

## 高度错落的关键

瀑布流好看的关键是**卡片高度不一**。因为标题分行数不同、描述长短不同，即使图片一样高，卡片也会自然错落。

如果希望图片本身也是大比例的，可以给封面设置不同的 `aspect-ratio`：

```css
.card-cover { aspect-ratio: 3 / 4; }   /* 竖图 */
.card-cover.wide { aspect-ratio: 4 / 3; } /* 横图 */
```

## 一个小缺点

CSS 多列的填充顺序是"先填满第一列，再填第二列"，所以顺序是从上往下列式排列。对信息流场景来说完全可接受；如果你需要严格的"从左到右的视觉顺序"，那才需要引入 JS 布局。

## 总结

| 方案 | 优点 | 缺点 |
|------|------|------|
| CSS `columns` | 简单、零依赖 | 顺序按列 |
| JS 绝对定位 | 视觉顺序精确 | 需要监听尺寸 |

对大多数博客和内容站，CSS 的方案已经足够优雅。动手试试吧。