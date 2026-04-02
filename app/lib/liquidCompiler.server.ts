import type { Column, Element, PageContent, Section } from "./pageSchema";

function getYoutubeEmbedUrl(url: string) {
  const match =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);

  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getVimeoEmbedUrl(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

function getScopedCustomCss(selector: string, customCss: string) {
  const value = customCss?.trim();
  if (!value) return "";

  if (value.includes("{")) {
    return value.replace(/&/g, selector);
  }

  return `${selector} { ${value} }`;
}

export function compileLiquid(content: PageContent): {
  liquid: string;
  css: string;
} {
  const cssBlocks: string[] = [];
  const liquidBlocks: string[] = [];

  cssBlocks.push(`
    .pb-page { font-family: ${content.globalStyles.fontFamily}; background-color: ${content.globalStyles.backgroundColor}; min-height: 100%; }
    .pb-page, .pb-page *, .pb-page *::before, .pb-page *::after { box-sizing: border-box; }
    .pb-container { max-width: ${content.globalStyles.maxWidth}px; margin: 0 auto; }
    [data-pb-accordion-panel][hidden], [data-pb-tab-panel][hidden] { display: none !important; }
    [data-pb-slider-slide] { display: none; }
    [data-pb-slider-slide].is-active { display: flex; }
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
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.classList.add('animate__animated', el.dataset.animation);
          if (el.dataset.once !== 'false') obs.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-animation]').forEach((el) => obs.observe(el));

    document.querySelectorAll('[data-pb-accordion]').forEach((accordion) => {
      const allowMultiple = accordion.getAttribute('data-allow-multiple') === 'true';
      const items = Array.from(accordion.querySelectorAll('[data-pb-accordion-item]'));
      accordion.querySelectorAll('[data-pb-accordion-trigger]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const item = trigger.closest('[data-pb-accordion-item]');
          if (!item) return;
          const nextOpen = !item.classList.contains('is-open');

          if (!allowMultiple) {
            items.forEach((candidate) => {
              candidate.classList.remove('is-open');
              const panel = candidate.querySelector('[data-pb-accordion-panel]');
              const button = candidate.querySelector('[data-pb-accordion-trigger]');
              if (panel) panel.hidden = true;
              if (button) button.setAttribute('aria-expanded', 'false');
            });
          }

          item.classList.toggle('is-open', nextOpen);
          const panel = item.querySelector('[data-pb-accordion-panel]');
          if (panel) panel.hidden = !nextOpen;
          trigger.setAttribute('aria-expanded', String(nextOpen));
        });
      });
    });

    document.querySelectorAll('[data-pb-tabs]').forEach((tabs) => {
      const buttons = Array.from(tabs.querySelectorAll('[data-pb-tab-button]'));
      const panels = Array.from(tabs.querySelectorAll('[data-pb-tab-panel]'));
      const activate = (tabId) => {
        buttons.forEach((candidate) => {
          const isActive = candidate.getAttribute('data-pb-tab-button') === tabId;
          const activeColor = candidate.getAttribute('data-active-color') || '#111111';
          const inactiveColor = candidate.getAttribute('data-inactive-color') || '#888888';
          candidate.classList.toggle('is-active', isActive);
          candidate.style.color = isActive ? activeColor : inactiveColor;
          candidate.style.borderBottomColor = isActive ? activeColor : 'transparent';
        });
        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute('data-pb-tab-panel') !== tabId;
        });
      };

      const initialTab =
        buttons.find((button) => button.classList.contains('is-active'))?.getAttribute('data-pb-tab-button') ||
        buttons[0]?.getAttribute('data-pb-tab-button');

      if (initialTab) activate(initialTab);

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const tabId = button.getAttribute('data-pb-tab-button');
          if (tabId) activate(tabId);
        });
      });
    });

    document.querySelectorAll('[data-pb-countdown]').forEach((countdown) => {
      const targetDate = countdown.getAttribute('data-target-date');
      const expiredText = countdown.getAttribute('data-expired-text') || '';
      if (!targetDate) return;
      const target = new Date(targetDate).getTime();
      const parts = Array.from(countdown.querySelectorAll('[data-pb-count-part]'));
      const expiredNode = countdown.querySelector('[data-pb-count-expired]');

      const updateCountdown = () => {
        const distance = Math.max(0, target - Date.now());
        const values = {
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000),
        };

        parts.forEach((part) => {
          const key = part.getAttribute('data-pb-count-part');
          const value = key && key in values ? values[key] : 0;
          part.textContent = String(value).padStart(2, '0');
        });

        if (distance <= 0 && expiredNode && expiredText) {
          expiredNode.hidden = false;
        }
      };

      updateCountdown();
      setInterval(updateCountdown, 1000);
    });

    document.querySelectorAll('[data-pb-form]').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const success = form.querySelector('[data-pb-form-success]');
        if (success) success.hidden = false;
      });
    });

    document.querySelectorAll('[data-pb-slider]').forEach((slider) => {
      const slides = Array.from(slider.querySelectorAll('[data-pb-slider-slide]'));
      const dots = Array.from(slider.querySelectorAll('[data-pb-slider-dot]'));
      if (!slides.length) return;

      let current = 0;
      let timer = null;
      const autoplay = slider.getAttribute('data-autoplay') !== 'false';
      const speed = Number(slider.getAttribute('data-speed') || 5000);

      const showSlide = (index) => {
        current = index;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
          dot.style.opacity = dotIndex === current ? '1' : '0.4';
        });
      };

      const startTimer = () => {
        if (!autoplay || slides.length < 2) return;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          showSlide((current + 1) % slides.length);
        }, Math.max(speed, 1200));
      };

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
          startTimer();
        });
      });

      showSlide(0);
      startTimer();
    });
    </script>
  `);

  return { liquid: liquidBlocks.join("\n"), css: cssBlocks.join("\n") };
}

function compileSection(section: Section): {
  sectionLiquid: string;
  sectionCss: string;
} {
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
    s.borderWidth
      ? `  border: ${s.borderWidth}px ${s.borderStyle} ${s.borderColor};`
      : "",
    s.borderRadius ? `  border-radius: ${s.borderRadius}px;` : "",
    `}`,
    `@media (max-width: 768px) { #${sId} { padding: ${s.paddingTop.tablet}px ${s.paddingRight.tablet}px ${s.paddingBottom.tablet}px ${s.paddingLeft.tablet}px; } }`,
    `@media (max-width: 480px) { #${sId} { padding: ${s.paddingTop.mobile}px ${s.paddingRight.mobile}px ${s.paddingBottom.mobile}px ${s.paddingLeft.mobile}px; } }`,
  ].filter(Boolean);

  const sectionCustomCss = getScopedCustomCss(`#${sId}`, s.customCss || "");
  if (sectionCustomCss) cssLines.push(sectionCustomCss);

  const animAttr =
    s.animation.type !== "none"
      ? `data-animation="animate__${s.animation.type}" data-once="${s.animation.once}" style="animation-duration:${s.animation.duration}ms; animation-delay:${s.animation.delay}ms;"`
      : "";

  const columnsHtml = section.columns
    .map((col) => compileColumn(col))
    .join("\n");

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
  const justifyContent =
    col.settings.verticalAlign === "middle"
      ? "center"
      : col.settings.verticalAlign === "bottom"
        ? "flex-end"
        : "flex-start";
  const style = `flex:0 0 ${width}%; max-width:${width}%;`;

  const elementsHtml = col.elements
    .filter((el: any) => el.visible)
    .map((el: any) => compileElement(el as Element))
    .join("\n");

  return `
<div class="pb-column" style="${style}; padding:${col.settings.paddingTop.desktop}px ${col.settings.paddingRight.desktop}px ${col.settings.paddingBottom.desktop}px ${col.settings.paddingLeft.desktop}px; display:flex; flex-direction:column; justify-content:${justifyContent}; background-color:${col.settings.backgroundColor};">
  ${elementsHtml}
</div>`;
}

function compileElement(el: Element): string {
  const elId = `pb-el-${(el as any).id}`;
  const s = (el as any).settings;
  const bp = (v: any) => v?.desktop ?? v;

  const baseStyle = [
    `display: ${bp(s.display)}`,
    `margin: ${bp(s.marginTop)}px ${bp(s.marginRight)}px ${bp(s.marginBottom)}px ${bp(s.marginLeft)}px`,
    `padding: ${bp(s.paddingTop)}px ${bp(s.paddingRight)}px ${bp(s.paddingBottom)}px ${bp(s.paddingLeft)}px`,
    `text-align: ${bp(s.textAlign)}`,
    `width: ${bp(s.width)}`,
    `max-width: ${bp(s.maxWidth)}`,
    s.backgroundColor !== "transparent"
      ? `background-color: ${s.backgroundColor}`
      : "",
    s.opacity !== 1 ? `opacity: ${s.opacity}` : "",
    s.borderWidth
      ? `border: ${s.borderWidth}px ${s.borderStyle} ${s.borderColor}; border-radius: ${s.borderRadius}px`
      : "",
  ]
    .filter(Boolean)
    .join("; ");

  const animAttr =
    s.animation.type !== "none"
      ? `data-animation="animate__${s.animation.type}" data-once="${s.animation.once}"`
      : "";

  const customSelector = s.customId ? `#${s.customId}` : `#${elId}`;
  const customStyle = getScopedCustomCss(customSelector, s.customCss || "")
    ? `<style>${getScopedCustomCss(customSelector, s.customCss || "")}</style>`
    : "";
  const extraClass = s.customClass ? ` ${s.customClass}` : "";
  const idAttr = s.customId ? `id="${s.customId}"` : `id="${elId}"`;

  let inner = "";

  switch ((el as any).type) {
    case "heading": {
      const c = (el as any).content;
      const linkStart = c.linkUrl
        ? `<a href="${c.linkUrl}" target="${c.linkTarget || "_self"}">`
        : "";
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
      inner = c.linkUrl
        ? `<a href="${c.linkUrl}" target="${c.linkTarget || "_self"}">${img}</a>`
        : img;
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
    case "divider": {
      const c = (el as any).content;
      const justifyContent =
        c.alignment === "left"
          ? "flex-start"
          : c.alignment === "right"
            ? "flex-end"
            : "center";
      inner = `
        <div style="display:flex; justify-content:${justifyContent};">
          <div style="width:${c.width}%; border-top:${c.thickness}px ${c.style} ${c.color};"></div>
        </div>`;
      break;
    }
    case "spacer": {
      const c = (el as any).content;
      inner = `<div style="height:${bp(c.height)}px;"></div>`;
      break;
    }
    case "html": {
      const c = (el as any).content;
      inner = c.html || "";
      break;
    }
    case "liquid": {
      const c = (el as any).content;
      inner = c.liquid || "";
      break;
    }
    case "video": {
      const c = (el as any).content;
      const embedUrl =
        getYoutubeEmbedUrl(c.url || "") || getVimeoEmbedUrl(c.url || "");
      const paddingTop =
        c.aspectRatio === "1:1"
          ? "100%"
          : c.aspectRatio === "4:3"
            ? "75%"
            : c.aspectRatio === "21:9"
              ? "42.85%"
              : "56.25%";

      inner = embedUrl
        ? `
        <div style="position:relative; width:100%; padding-top:${paddingTop}; border-radius:${s.borderRadius || 12}px; overflow:hidden; background:#0f172a;">
          <iframe src="${embedUrl}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>
        </div>`
        : `
        <div style="padding:20px; border-radius:14px; background:#0f172a; color:#e2e8f0; text-align:center;">
          ${c.posterImage ? `<img src="${c.posterImage}" alt="" style="width:100%; display:block; border-radius:12px; margin-bottom:12px;" />` : ""}
          Add a YouTube or Vimeo URL to preview the video.
        </div>`;
      break;
    }
    case "map": {
      const c = (el as any).content;
      const query = encodeURIComponent(c.query || c.address || "New York, NY");
      inner = `<div style="position:relative; width:100%; padding-top:56.25%; overflow:hidden; border-radius:${s.borderRadius || 12}px;">
        <iframe src="https://www.google.com/maps?q=${query}&output=embed" title="Map" style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>
      </div>`;
      break;
    }
    case "icon": {
      const c = (el as any).content;
      inner = `<div style="display:inline-flex; align-items:center; justify-content:center; width:${bp(c.size)}px; height:${bp(c.size)}px; color:${c.color}; font-size:${Math.max(18, (bp(c.size) || 40) / 2)}px;">${c.icon === "star" ? "★" : "●"}</div>`;
      break;
    }
    case "social_icons": {
      const c = (el as any).content;
      inner = `<div style="display:flex; gap:${c.gap || 12}px; justify-content:${c.alignment === "left" ? "flex-start" : c.alignment === "right" ? "flex-end" : "center"}; flex-wrap:wrap;">
        ${(c.icons || [])
          .map(
            (item: any) =>
              `<a href="${item.url || "#"}" style="display:inline-flex; align-items:center; justify-content:center; width:${c.iconSize || 24}px; height:${c.iconSize || 24}px; color:${c.iconColor || "#111"}; text-decoration:none; border:1px solid #cbd5e1; border-radius:${c.iconStyle === "filled" ? "999px" : "0"}; font-size:11px; text-transform:uppercase;">${String(item.platform || "icon").slice(0, 2)}</a>`,
          )
          .join("")}
      </div>`;
      break;
    }
    case "testimonial": {
      const c = (el as any).content;
      inner = `<div style="display:grid; grid-template-columns:repeat(${Math.min(c.columns?.desktop || 3, 3)}, minmax(0, 1fr)); gap:12px;">
        ${(c.items || [])
          .map(
            (item: any) => `
            <div style="border:1px solid #e2e8f0; border-radius:14px; padding:14px; background:#fff;">
              <div style="font-size:13px; line-height:1.6; color:#334155;">${item.quote || ""}</div>
              <div style="margin-top:10px; font-size:12px; color:#64748b;">${item.author || ""}${item.role ? ` • ${item.role}` : ""}</div>
            </div>`,
          )
          .join("")}
      </div>`;
      break;
    }
    case "accordion": {
      const c = (el as any).content;
      inner = `<div data-pb-accordion data-allow-multiple="${c.allowMultiple ? "true" : "false"}" style="display:flex; flex-direction:column; gap:8px;">
        ${(c.items || [])
          .map(
            (item: any, index: number) => `
            <div data-pb-accordion-item class="${index === 0 ? "is-open" : ""}" style="border:1px solid ${c.borderColor || "#e5e7eb"}; border-radius:12px; overflow:hidden; background:#fff;">
              <button type="button" data-pb-accordion-trigger aria-expanded="${index === 0 ? "true" : "false"}" style="width:100%; text-align:left; border:0; background:#f8fafc; padding:12px; font-weight:600; color:${c.headingColor || "#111"}; cursor:pointer;">${item.question || ""}</button>
              <div data-pb-accordion-panel ${index === 0 ? "" : "hidden"} style="padding:12px; color:${c.contentColor || "#555"};">${item.answer || ""}</div>
            </div>`,
          )
          .join("")}
      </div>`;
      break;
    }
    case "tabs": {
      const c = (el as any).content;
      inner = `<div data-pb-tabs>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
          ${(c.tabs || [])
            .map(
              (tab: any, index: number) => `
              <button type="button" data-pb-tab-button="${tab.id}" data-active-color="${c.activeColor || "#111"}" data-inactive-color="${c.inactiveColor || "#888"}" class="${index === 0 ? "is-active" : ""}" style="border:0; background:transparent; border-bottom:2px solid ${index === 0 ? c.activeColor || "#111" : "transparent"}; color:${index === 0 ? c.activeColor || "#111" : c.inactiveColor || "#888"}; padding:8px 12px; font-weight:600; cursor:pointer;">${tab.label || ""}</button>`,
            )
            .join("")}
        </div>
        ${(c.tabs || [])
          .map(
            (tab: any, index: number) => `
            <div data-pb-tab-panel="${tab.id}" ${index === 0 ? "" : "hidden"} style="border:1px solid #e2e8f0; border-radius:12px; padding:12px; background:#fff;">${tab.content || ""}</div>`,
          )
          .join("")}
      </div>`;
      break;
    }
    case "countdown": {
      const c = (el as any).content;
      inner = `<div data-pb-countdown data-target-date="${c.targetDate}" data-expired-text="${c.expiredText || ""}" style="display:flex; gap:8px; flex-wrap:wrap;">
        ${[
          c.showDays !== false ? { key: "days", label: "Days" } : null,
          c.showHours !== false ? { key: "hours", label: "Hours" } : null,
          c.showMinutes !== false ? { key: "minutes", label: "Minutes" } : null,
          c.showSeconds !== false ? { key: "seconds", label: "Seconds" } : null,
        ]
          .filter(Boolean)
          .map(
            (part: any) => `
            <div style="min-width:68px; padding:12px; border-radius:12px; background:#fff; border:1px solid #e2e8f0; text-align:center;">
              <div data-pb-count-part="${part.key}" style="font-size:20px; font-weight:700; color:${c.numberColor || "#111"};">00</div>
              <div style="margin-top:4px; font-size:11px; color:${c.labelColor || "#888"};">${part.label}</div>
            </div>`,
          )
          .join("")}
        ${c.expiredText ? `<div data-pb-count-expired hidden style="width:100%; color:#64748b; font-size:13px;">${c.expiredText}</div>` : ""}
      </div>`;
      break;
    }
    case "form": {
      const c = (el as any).content;
      inner = `<form data-pb-form style="display:flex; flex-direction:column; gap:10px;">
        ${(c.fields || [])
          .map(
            (field: any) => `
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:12px; color:#334155;">${field.label || ""}</label>
              <input type="${field.type || "text"}" placeholder="${field.placeholder || ""}" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid ${c.inputBorderColor || "#d1d5db"};" />
            </div>`,
          )
          .join("")}
        <button type="submit" style="margin-top:4px; padding:12px 16px; border:0; border-radius:10px; background:${c.buttonColor || "#111"}; color:${c.buttonTextColor || "#fff"}; font-weight:600;">${c.submitText || "Submit"}</button>
        ${c.successMessage ? `<div data-pb-form-success hidden style="font-size:13px; color:#0f766e;">${c.successMessage}</div>` : ""}
      </form>`;
      break;
    }
    case "slider": {
      const c = (el as any).content;
      const slides =
        Array.isArray(c.slides) && c.slides.length > 0
          ? c.slides
          : [
              {
                heading: "Slide one",
                text: "Add slides in the block settings.",
              },
            ];
      const height = Math.max(180, bp(c.height) || 300);
      inner = `<div data-pb-slider data-autoplay="${c.autoplay !== false}" data-speed="${c.autoplaySpeed || 5000}">
        <div style="position:relative; min-height:${height}px; border-radius:14px; overflow:hidden; background:#0f172a; color:#e2e8f0;">
          ${slides
            .map(
              (slide: any, index: number) => `
              <div data-pb-slider-slide class="${index === 0 ? "is-active" : ""}" style="position:${index === 0 ? "relative" : "absolute"}; inset:0; min-height:${height}px; padding:28px; align-items:flex-end; background:${slide.image || slide.imageUrl || slide.src ? `linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.8)), url(${slide.image || slide.imageUrl || slide.src}) center/cover no-repeat` : "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)"};">
                <div style="max-width:520px;">
                  <div style="font-size:30px; font-weight:700; line-height:1.1;">${slide.heading || slide.title || `Slide ${index + 1}`}</div>
                  <div style="margin-top:10px; font-size:14px; line-height:1.6;">${slide.text || slide.subtitle || ""}</div>
                </div>
              </div>`,
            )
            .join("")}
        </div>
        ${
          c.showDots === false
            ? ""
            : `<div style="display:flex; justify-content:center; gap:6px; margin-top:10px;">
          ${slides
            .map(
              (_: any, index: number) => `
              <button type="button" data-pb-slider-dot style="width:10px; height:10px; border-radius:999px; border:0; background:#0f172a; opacity:${index === 0 ? "1" : "0.4"}; cursor:pointer;"></button>`,
            )
            .join("")}
        </div>`
        }
      </div>`;
      break;
    }
    case "product_card": {
      inner = `<div style="border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; background:#fff;">
        <div style="aspect-ratio:1/1; background:#f1f5f9;"></div>
        <div style="padding:12px;">
          <div style="font-weight:600; color:#0f172a;">Product card preview</div>
          <div style="margin-top:4px; font-size:12px; color:#64748b;">Connect product data later</div>
        </div>
      </div>`;
      break;
    }
    case "product_grid":
    case "collection": {
      inner = `<div style="display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:10px;">
        ${[0, 1, 2]
          .map(
            () => `
            <div style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; background:#fff;">
              <div style="aspect-ratio:1/1; background:#f1f5f9;"></div>
              <div style="padding:10px; font-size:12px; color:#475569;">${(el as any).type === "collection" ? "Collection" : "Product"}</div>
            </div>`,
          )
          .join("")}
      </div>`;
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
