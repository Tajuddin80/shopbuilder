import type { Column, Element, PageContent, Section } from "./pageSchema";

export function compileLiquid(content: PageContent): { liquid: string; css: string } {
  const cssBlocks: string[] = [];
  const liquidBlocks: string[] = [];

  cssBlocks.push(`
    .pb-page { font-family: ${content.globalStyles.fontFamily}; background-color: ${content.globalStyles.backgroundColor}; }
    .pb-container { max-width: ${content.globalStyles.maxWidth}px; margin: 0 auto; }
    ${content.globalStyles.customCss || ""}
  `);

  liquidBlocks.push(
    `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>`,
  );
  liquidBlocks.push(`<div class="pb-page">`);

  for (const section of content.sections) {
    if (!section.visible) continue;
    const { sectionLiquid, sectionCss } = compileSection(section);
    liquidBlocks.push(sectionLiquid);
    cssBlocks.push(sectionCss);
  }

  liquidBlocks.push(`</div>`);
  liquidBlocks.push(`
    <script>
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          el.classList.add('animate__animated', el.dataset.animation);
          if (el.dataset.once !== 'false') obs.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-animation]').forEach(el => obs.observe(el));
    </script>
  `);

  return { liquid: liquidBlocks.join("\n"), css: cssBlocks.join("\n") };
}

function compileSection(section: Section): { sectionLiquid: string; sectionCss: string } {
  const s = section.settings;
  const sId = `pb-section-${section.id}`;
  const bp = (v: any) => v?.desktop ?? v;

  const cssLines = [
    `#${sId} { `,
    `  background-color: ${bp(s.backgroundColor)};`,
    `  padding: ${bp(s.paddingTop)}px ${bp(s.paddingRight)}px ${bp(s.paddingBottom)}px ${bp(s.paddingLeft)}px;`,
    `  margin: ${bp(s.marginTop)}px 0 ${bp(s.marginBottom)}px 0;`,
    s.minHeight?.desktop ? `  min-height: ${s.minHeight.desktop}px;` : "",
    s.backgroundImage
      ? `  background-image: url(${s.backgroundImage}); background-size: ${s.backgroundSize}; background-position: ${s.backgroundPosition};`
      : "",
    s.borderWidth ? `  border: ${s.borderWidth}px ${s.borderStyle} ${s.borderColor};` : "",
    s.borderRadius ? `  border-radius: ${s.borderRadius}px;` : "",
    `}`,
    `@media (max-width: 768px) { #${sId} { padding: ${s.paddingTop.tablet}px ${s.paddingRight.tablet}px ${s.paddingBottom.tablet}px ${s.paddingLeft.tablet}px; } }`,
    `@media (max-width: 480px) { #${sId} { padding: ${s.paddingTop.mobile}px ${s.paddingRight.mobile}px ${s.paddingBottom.mobile}px ${s.paddingLeft.mobile}px; } }`,
  ].filter(Boolean);

  if (s.customCss) cssLines.push(`#${sId} { ${s.customCss} }`);

  const animAttr =
    s.animation.type !== "none"
      ? `data-animation="animate__${s.animation.type}" data-once="${s.animation.once}" style="animation-duration:${s.animation.duration}ms; animation-delay:${s.animation.delay}ms;"`
      : "";

  const columnsHtml = section.columns.map((col) => compileColumn(col)).join("\n");

  const liquid = `
<div id="${sId}" class="pb-section${s.customClass ? " " + s.customClass : ""}" ${animAttr} ${s.customId ? `data-custom-id="${s.customId}"` : ""}>
  <div class="${s.fullWidth ? "" : "pb-container"}">
    <div class="pb-columns" style="display:flex; flex-wrap:wrap;">
      ${columnsHtml}
    </div>
  </div>
</div>`;

  return { sectionLiquid: liquid, sectionCss: cssLines.join("\n") };
}

function compileColumn(col: Column): string {
  const width = col.width.desktop;
  const style = `width:${width}%;`;

  const elementsHtml = col.elements
    .filter((el: any) => el.visible)
    .map((el: any) => compileElement(el as Element))
    .join("\n");

  return `
<div class="pb-column" style="${style}; padding:${col.settings.paddingTop.desktop}px ${col.settings.paddingRight.desktop}px ${col.settings.paddingBottom.desktop}px ${col.settings.paddingLeft.desktop}px; vertical-align:${col.settings.verticalAlign}; background-color:${col.settings.backgroundColor};">
  ${elementsHtml}
</div>`;
}

function compileElement(el: Element): string {
  const elId = `pb-el-${(el as any).id}`;
  const s = (el as any).settings;
  const bp = (v: any) => v?.desktop ?? v;

  const baseStyle = [
    `margin: ${bp(s.marginTop)}px ${bp(s.marginRight)}px ${bp(s.marginBottom)}px ${bp(s.marginLeft)}px`,
    `padding: ${bp(s.paddingTop)}px ${bp(s.paddingRight)}px ${bp(s.paddingBottom)}px ${bp(s.paddingLeft)}px`,
    `text-align: ${bp(s.textAlign)}`,
    `width: ${bp(s.width)}`,
    s.backgroundColor !== "transparent" ? `background-color: ${s.backgroundColor}` : "",
    s.opacity !== 1 ? `opacity: ${s.opacity}` : "",
    s.borderWidth ? `border: ${s.borderWidth}px ${s.borderStyle} ${s.borderColor}; border-radius: ${s.borderRadius}px` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const animAttr =
    s.animation.type !== "none"
      ? `data-animation="animate__${s.animation.type}" data-once="${s.animation.once}"`
      : "";

  const customStyle = s.customCss ? `<style>#${elId}{${s.customCss}}</style>` : "";
  const extraClass = s.customClass ? ` ${s.customClass}` : "";
  const idAttr = s.customId ? `id="${s.customId}"` : `id="${elId}"`;

  let inner = "";

  switch ((el as any).type) {
    case "heading": {
      const c = (el as any).content;
      const linkStart = c.linkUrl ? `<a href="${c.linkUrl}" target="${c.linkTarget || "_self"}">` : "";
      const linkEnd = c.linkUrl ? "</a>" : "";
      inner = `<${c.tag} style="font-size:${c.fontSize?.desktop || 32}px; color:${c.color}; font-weight:${c.fontWeight}; font-family:${c.fontFamily}; line-height:${c.lineHeight}; letter-spacing:${c.letterSpacing}px; text-transform:${c.textTransform};">${linkStart}${c.text}${linkEnd}</${c.tag}>`;
      break;
    }
    case "text": {
      const c = (el as any).content;
      inner = `<div style="font-size:${bp(c.fontSize)}px; color:${c.color}; font-family:${c.fontFamily}; line-height:${c.lineHeight};">${c.html}</div>`;
      break;
    }
    case "image": {
      const c = (el as any).content;
      const img = `<img src="${c.src}" alt="${c.alt}" loading="${c.loading}" style="width:100%; object-fit:${c.objectFit}; display:block;"/>`;
      inner = c.linkUrl ? `<a href="${c.linkUrl}" target="${c.linkTarget || "_self"}">${img}</a>` : img;
      break;
    }
    case "button": {
      const c = (el as any).content;
      inner = `
        <a href="${c.url}" target="${c.target || "_self"}"
           style="background-color:${c.backgroundColor}; color:${c.textColor}; border:2px solid ${c.borderColor}; display:inline-block; padding:${c.size === "small" ? "8px 16px" : c.size === "large" ? "16px 36px" : "12px 24px"}; border-radius:4px; text-decoration:none; font-weight:600; transition:all 0.2s;">
          ${c.text}
        </a>`;
      break;
    }
    default:
      inner = `<!-- Unsupported element type: ${(el as any).type} -->`;
  }

  return `
${customStyle}
<div ${idAttr} class="pb-element pb-element--${(el as any).type}${extraClass}" style="${baseStyle}" ${animAttr}>
  ${inner}
</div>`;
}

