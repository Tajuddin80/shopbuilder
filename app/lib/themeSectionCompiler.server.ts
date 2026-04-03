import type { Element, Section } from "./pageSchema";
import { richTextMarkup } from "./richText";

type ResponsiveLike<T> =
  | T
  | {
      desktop?: T;
      tablet?: T;
      mobile?: T;
    }
  | null
  | undefined;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getResponsiveValue<T>(value: ResponsiveLike<T>, fallback: T): T {
  if (isRecord(value)) {
    const desktop = value.desktop;
    if (desktop !== undefined) return desktop as T;
  }

  return (value ?? fallback) as T;
}

function toNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toItems<T extends Record<string, unknown>>(value: unknown) {
  return Array.isArray(value) ? (value as T[]) : [];
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: unknown) {
  return escapeHtml(value);
}

function escapeCssUrl(value: string) {
  return encodeURI(value).replace(/'/g, "%27");
}

function sanitizeCustomMarkup(value: unknown) {
  return toStringValue(value)
    .replace(/\{%\s*schema\s*%\}/gi, "{% comment %}schema removed{% endcomment %}")
    .replace(/\{%\s*endschema\s*%\}/gi, "{% comment %}endschema removed{% endcomment %}");
}

function joinStyles(parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function sanitizeClassName(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, "-");
}

function getButtonPadding(size: string) {
  switch (size) {
    case "small":
      return "10px 16px";
    case "large":
      return "16px 28px";
    default:
      return "12px 22px";
  }
}

function getAspectRatio(value: string) {
  switch (value) {
    case "portrait":
      return "4 / 5";
    case "landscape":
      return "4 / 3";
    case "wide":
      return "16 / 9";
    default:
      return "1 / 1";
  }
}

function getEmbedUrl(value: string) {
  if (!value) return "";
  if (value.includes("youtube.com/watch?v=")) {
    return value.replace("watch?v=", "embed/");
  }
  if (value.includes("youtu.be/")) {
    return value.replace("youtu.be/", "youtube.com/embed/");
  }
  if (value.includes("vimeo.com/")) {
    return value.replace("vimeo.com/", "player.vimeo.com/video/");
  }
  return value;
}

function getIconGlyph(value: string) {
  switch (value) {
    case "heart":
      return "&#9829;";
    case "check":
      return "&#10003;";
    case "circle":
      return "&#9679;";
    default:
      return "&#9733;";
  }
}

function getJustify(value: string) {
  switch (value) {
    case "center":
      return "center";
    case "right":
      return "flex-end";
    default:
      return "flex-start";
  }
}

function getColumnAlignment(value: string) {
  switch (value) {
    case "middle":
      return "center";
    case "bottom":
      return "flex-end";
    default:
      return "flex-start";
  }
}

function getInitials(value: string) {
  const parts = value
    .split(/[\s_-]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "SB";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function getHeadingTag(value: string) {
  return ["h1", "h2", "h3", "h4", "p", "div"].includes(value) ? value : "h2";
}

function buildSectionSchema({
  displayName,
  section,
  containerWidth,
}: {
  displayName: string;
  section: Section;
  containerWidth: number;
}) {
  return {
    name: displayName,
    tag: "section",
    class: "shopbuilder-saved-section",
    settings: [
      {
        type: "paragraph",
        content:
          "Built with Shop Builder. Edit content in the app, then save again to resync this section.",
      },
      {
        type: "checkbox",
        id: "sb_full_width",
        label: "Full width",
        default: Boolean(section.settings.fullWidth),
      },
      {
        type: "range",
        id: "sb_container_width",
        label: "Container width",
        min: 600,
        max: 1800,
        step: 20,
        default: Math.max(600, Math.min(1800, Math.round(containerWidth || 1200))),
      },
      {
        type: "range",
        id: "sb_padding_top",
        label: "Padding top",
        min: 0,
        max: 200,
        step: 4,
        default: Math.max(
          0,
          Math.min(200, toNumber(section.settings.paddingTop.desktop, 40)),
        ),
      },
      {
        type: "range",
        id: "sb_padding_bottom",
        label: "Padding bottom",
        min: 0,
        max: 200,
        step: 4,
        default: Math.max(
          0,
          Math.min(200, toNumber(section.settings.paddingBottom.desktop, 40)),
        ),
      },
      {
        type: "color",
        id: "sb_background_color",
        label: "Background color",
        default: toStringValue(
          section.settings.backgroundColor.desktop,
          "#ffffff",
        ),
      },
    ],
    presets: [{ name: displayName, category: "ShopBuilder" }],
  };
}

function buildElementMarkup({
  element,
  columnIndex,
  elementIndex,
}: {
  element: Element;
  columnIndex: number;
  elementIndex: number;
}) {
  const content = isRecord((element as { content?: unknown }).content)
    ? (element as { content?: Record<string, unknown> }).content!
    : {};
  const settings = element.settings;
  const elementId = `shopbuilder-c${columnIndex + 1}-e${elementIndex + 1}-{{ section.id }}`;
  const customId = toStringValue(settings.customId).trim();
  const customClass = toStringValue(settings.customClass).trim();
  const customCss = toStringValue(settings.customCss).trim();

  const wrapperStyles = joinStyles([
    `display:${element.visible ? getResponsiveValue(settings.display, "block") : "none"};`,
    `width:${getResponsiveValue(settings.width, "100%")};`,
    `max-width:${getResponsiveValue(settings.maxWidth, "100%")};`,
    `margin:${getResponsiveValue(settings.marginTop, 0)}px ${getResponsiveValue(settings.marginRight, 0)}px ${getResponsiveValue(settings.marginBottom, 0)}px ${getResponsiveValue(settings.marginLeft, 0)}px;`,
    `padding:${getResponsiveValue(settings.paddingTop, 0)}px ${getResponsiveValue(settings.paddingRight, 0)}px ${getResponsiveValue(settings.paddingBottom, 0)}px ${getResponsiveValue(settings.paddingLeft, 0)}px;`,
    `text-align:${getResponsiveValue(settings.textAlign, "left")};`,
    settings.backgroundColor !== "transparent"
      ? `background:${settings.backgroundColor};`
      : "",
    settings.borderWidth > 0
      ? `border:${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor};`
      : "",
    settings.borderRadius > 0 ? `border-radius:${settings.borderRadius}px;` : "",
    settings.opacity !== 1 ? `opacity:${settings.opacity};` : "",
    "box-sizing:border-box;",
  ]);
  const animationMarkup =
    settings.animation?.type && settings.animation.type !== "none"
      ? ` data-sb-animation="${escapeAttribute(settings.animation.type)}" data-sb-animation-once="${settings.animation.once ? "true" : "false"}" style="${escapeAttribute(joinStyles([wrapperStyles, `--sb-animation-duration:${settings.animation.duration}ms;`, `--sb-animation-delay:${settings.animation.delay}ms;`]))}"`
      : ` style="${escapeAttribute(wrapperStyles)}"`;

  const contentMarkup = buildElementContent({
    element,
    content,
    wrapperId: elementId,
  });

  return `<div id="${elementId}"${customId ? ` data-custom-id="${escapeAttribute(customId)}"` : ""} class="sb-native-element sb-native-element--${sanitizeClassName(element.type)}${customClass ? ` ${escapeAttribute(customClass)}` : ""}"${animationMarkup}>
${customCss ? `  <style>#${elementId} { ${customCss} }</style>\n` : ""}  ${contentMarkup}
</div>`;
}

function buildElementContent({
  element,
  content,
  wrapperId,
}: {
  element: Element;
  content: Record<string, unknown>;
  wrapperId: string;
}) {
  switch (element.type) {
    case "heading": {
      const text = escapeHtml(toStringValue(content.text, "Heading"));
      const tag = getHeadingTag(toStringValue(content.tag, "h2"));
      const linkUrl = toStringValue(content.linkUrl).trim();
      const target = toStringValue(content.linkTarget, "_self");
      const innerMarkup = linkUrl
        ? `<a href="${escapeAttribute(linkUrl)}"${target === "_blank" ? ' target="_blank" rel="noopener noreferrer"' : ""} style="color:inherit; text-decoration:none;">${text}</a>`
        : text;
      const styles = joinStyles([
        "margin:0;",
        `font-size:${toNumber(getResponsiveValue(content.fontSize, 32), 32)}px;`,
        `color:${toStringValue(content.color, "#111111")};`,
        `font-weight:${escapeAttribute(toStringValue(content.fontWeight, "700"))};`,
        toStringValue(content.fontFamily).trim()
          ? `font-family:${escapeAttribute(toStringValue(content.fontFamily))};`
          : "",
        toNumber(content.lineHeight, 0) > 0
          ? `line-height:${toNumber(content.lineHeight, 1.2)};`
          : "",
        `letter-spacing:${toNumber(content.letterSpacing, 0)}px;`,
        toStringValue(content.textTransform).trim()
          ? `text-transform:${escapeAttribute(toStringValue(content.textTransform))};`
          : "",
      ]);
      return `<${tag} style="${escapeAttribute(styles)}">${innerMarkup}</${tag}>`;
    }

    case "text": {
      const styles = joinStyles([
        `font-size:${toNumber(getResponsiveValue(content.fontSize, 16), 16)}px;`,
        `color:${toStringValue(content.color, "#444444")};`,
        `line-height:${toNumber(content.lineHeight, 1.6)};`,
        toStringValue(content.fontFamily).trim()
          ? `font-family:${escapeAttribute(toStringValue(content.fontFamily))};`
          : "",
      ]);
      return `<div style="${escapeAttribute(styles)}">${sanitizeCustomMarkup(
        richTextMarkup(content, "Text content"),
      )}</div>`;
    }

    case "image": {
      const src = toStringValue(content.src).trim();
      const alt = toStringValue(content.alt).trim();
      const linkUrl = toStringValue(content.linkUrl).trim();
      const objectFit = toStringValue(content.objectFit, "cover");
      const loading = toStringValue(content.loading, "lazy");
      const widthPx = toNumber(getResponsiveValue(content.widthPx, null), 0);
      const heightPx = toNumber(getResponsiveValue(content.heightPx, null), 0);
      const imageMarkup = src
        ? `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="${escapeAttribute(loading)}" style="width:${widthPx > 0 ? `${widthPx}px` : "100%"}; max-width:100%; height:${heightPx > 0 ? `${heightPx}px` : "auto"}; display:block; object-fit:${escapeAttribute(objectFit)}; border-radius:${element.settings.borderRadius}px;">`
        : `<div style="padding:24px; border:1px dashed #cbd5e1; border-radius:${element.settings.borderRadius}px; text-align:center; color:#64748b;">Add an image in Shop Builder.</div>`;
      return linkUrl
        ? `<a href="${escapeAttribute(linkUrl)}" style="display:block; text-decoration:none;">${imageMarkup}</a>`
        : imageMarkup;
    }

    case "button": {
      const variant = toStringValue(content.style, "filled");
      const text = escapeHtml(toStringValue(content.text, "Button"));
      const url = toStringValue(content.url, "#");
      const target = toStringValue(content.target, "_self");
      const backgroundColor = toStringValue(content.backgroundColor, "#111111");
      const textColor = toStringValue(content.textColor, "#ffffff");
      const borderColor = toStringValue(content.borderColor, backgroundColor);

      let buttonStyles = "";
      if (variant === "outline") {
        buttonStyles =
          `background:transparent; color:${textColor}; border:2px solid ${borderColor};`;
      } else if (variant === "text") {
        buttonStyles = "background:transparent; color:#111111; border:0;";
      } else {
        buttonStyles =
          `background:${backgroundColor}; color:${textColor}; border:2px solid ${borderColor};`;
      }

      return `<a href="${escapeAttribute(url)}"${target === "_blank" ? ' target="_blank" rel="noopener noreferrer"' : ""} style="display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; font-weight:600; border-radius:999px; padding:${getButtonPadding(toStringValue(content.size, "medium"))}; ${buttonStyles}">
  ${text}
</a>`;
    }

    case "divider": {
      const alignment = toStringValue(content.alignment, "center");
      return `<div style="display:flex; justify-content:${getJustify(alignment)};">
  <div style="width:${Math.max(1, Math.min(100, toNumber(content.width, 100)))}%; border-top:${Math.max(1, toNumber(content.thickness, 1))}px ${escapeAttribute(toStringValue(content.style, "solid"))} ${escapeAttribute(toStringValue(content.color, "#e5e7eb"))};"></div>
</div>`;
    }

    case "spacer":
      return `<div style="height:${Math.max(0, toNumber(getResponsiveValue(content.height, 40), 40))}px;"></div>`;

    case "html":
      return sanitizeCustomMarkup(content.html || "");

    case "liquid":
      return sanitizeCustomMarkup(content.liquid || "");

    case "video": {
      const url = toStringValue(content.url).trim();
      const posterImage = toStringValue(content.posterImage).trim();
      const isMp4 =
        toStringValue(content.videoType) === "mp4" || /\.mp4(\?|$)/i.test(url);
      const aspectRatio = toStringValue(content.aspectRatio, "16:9");

      if (isMp4 && url) {
        return `<div style="width:100%; border-radius:16px; overflow:hidden; background:#0f172a;">
  <video src="${escapeAttribute(url)}"${posterImage ? ` poster="${escapeAttribute(posterImage)}"` : ""}${toBoolean(content.autoplay) ? " autoplay playsinline" : ""}${toBoolean(content.loop) ? " loop" : ""}${toBoolean(content.muted) ? " muted" : ""}${toBoolean(content.controls, true) ? " controls" : ""} style="display:block; width:100%; aspect-ratio:${escapeAttribute(
          getAspectRatio(aspectRatio),
        )}; object-fit:cover;"></video>
</div>`;
      }

      if (url) {
        return `<div style="position:relative; width:100%; overflow:hidden; border-radius:16px; background:#0f172a; aspect-ratio:${escapeAttribute(
          getAspectRatio(aspectRatio),
        )};">
  <iframe src="${escapeAttribute(getEmbedUrl(url))}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>
</div>`;
      }

      if (posterImage) {
        return `<img src="${escapeAttribute(posterImage)}" alt="" style="width:100%; display:block; border-radius:16px;">`;
      }

      return `<div style="padding:24px; border-radius:16px; background:#0f172a; color:#e2e8f0; text-align:center;">Add a YouTube, Vimeo, or MP4 URL in Shop Builder.</div>`;
    }

    case "map":
      return `<div style="position:relative; width:100%; border-radius:16px; overflow:hidden; height:${Math.max(
        240,
        toNumber(getResponsiveValue(content.height, 420), 420),
      )}px;">
  <iframe src="https://www.google.com/maps?q=${encodeURIComponent(toStringValue(content.query, "New York, NY"))}&output=embed" title="Map" style="position:absolute; inset:0; width:100%; height:100%; border:0;"></iframe>
</div>`;

    case "icon": {
      const size = Math.max(16, toNumber(getResponsiveValue(content.size, 40), 40));
      const iconMarkup = `<span style="display:inline-flex; align-items:center; justify-content:center; width:${size}px; height:${size}px; font-size:${Math.max(12, Math.round(size / 2))}px; color:${escapeAttribute(toStringValue(content.color, "#111111"))};">${getIconGlyph(
        toStringValue(content.icon, "star"),
      )}</span>`;
      const linkUrl = toStringValue(content.linkUrl).trim();
      return linkUrl
        ? `<a href="${escapeAttribute(linkUrl)}" style="display:inline-flex; text-decoration:none;">${iconMarkup}</a>`
        : iconMarkup;
    }

    case "social_icons": {
      const icons = toItems<Record<string, unknown>>(content.icons);
      const gap = Math.max(0, toNumber(content.gap, 12));
      const size = Math.max(18, toNumber(content.iconSize, 24));
      const color = toStringValue(content.iconColor, "#111111");
      const alignment = getJustify(toStringValue(content.alignment, "center"));
      const filled = toStringValue(content.iconStyle, "logo") === "filled";
      return `<div style="display:flex; flex-wrap:wrap; gap:${gap}px; justify-content:${alignment};">
  ${icons
    .map((item) => {
      const platform = toStringValue(item.platform, "icon");
      const label = getInitials(platform);
      const url = toStringValue(item.url, "#");
      return `<a href="${escapeAttribute(url)}" aria-label="${escapeAttribute(platform)}" style="display:inline-flex; align-items:center; justify-content:center; min-width:${size}px; height:${size}px; padding:0 10px; border-radius:999px; border:1px solid ${filled ? color : "#cbd5e1"}; background:${filled ? color : "transparent"}; color:${filled ? "#ffffff" : color}; text-decoration:none; text-transform:uppercase; letter-spacing:0.08em; font-size:11px; font-weight:700;">${escapeHtml(
        label,
      )}</a>`;
    })
    .join("\n  ")}
</div>`;
    }

    case "testimonial": {
      const items = toItems<Record<string, unknown>>(content.items);
      const columns = Math.max(
        1,
        Math.min(4, toNumber(getResponsiveValue(content.columns, 3), 3)),
      );
      const tabletColumns = isRecord(content.columns)
        ? Math.max(1, Math.min(4, toNumber(content.columns.tablet, columns)))
        : Math.min(2, columns);
      const mobileColumns = isRecord(content.columns)
        ? Math.max(1, Math.min(4, toNumber(content.columns.mobile, 1)))
        : 1;
      const showRating = toBoolean(content.showRating, true);
      const showAvatar = toBoolean(content.showAvatar, false);

      return `<div data-sb-grid style="--sb-grid-columns:${columns}; --sb-grid-columns-tablet:${tabletColumns}; --sb-grid-columns-mobile:${mobileColumns};">
  ${items
    .map((item) => {
      const quote = escapeHtml(toStringValue(item.quote, "Amazing product."));
      const author = escapeHtml(toStringValue(item.author, "Customer"));
      const role = escapeHtml(toStringValue(item.role));
      const avatar = toStringValue(item.avatar).trim();
      const rating = Math.max(1, Math.min(5, toNumber(item.rating, 5)));
      return `<div style="display:flex; flex-direction:column; gap:12px; height:100%; padding:18px; border:1px solid #e2e8f0; border-radius:18px; background:#ffffff;">
  ${showAvatar ? `<div style="display:flex; align-items:center; gap:10px;">
    ${
      avatar
        ? `<img src="${escapeAttribute(avatar)}" alt="${author}" style="width:44px; height:44px; border-radius:999px; object-fit:cover;">`
        : `<div style="display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:999px; background:#dbeafe; color:#1d4ed8; font-size:13px; font-weight:700;">${escapeHtml(
            getInitials(author),
          )}</div>`
    }
    <div>
      <div style="font-weight:600; color:#0f172a;">${author}</div>
      ${role ? `<div style="font-size:12px; color:#64748b;">${role}</div>` : ""}
    </div>
  </div>` : ""}
  ${showRating ? `<div style="color:#f59e0b; letter-spacing:0.12em;">${"&#9733;".repeat(rating)}</div>` : ""}
  <div style="font-size:14px; line-height:1.7; color:#334155;">${quote}</div>
  ${
    !showAvatar
      ? `<div style="margin-top:auto; font-size:12px; color:#64748b;">${author}${role ? `, ${role}` : ""}</div>`
      : ""
  }
</div>`;
    })
    .join("\n  ")}
</div>`;
    }

    case "accordion": {
      const items = toItems<Record<string, unknown>>(content.items);
      const allowMultiple = toBoolean(content.allowMultiple, false);
      const defaultOpen = toStringValue(content.defaultOpen).trim();
      return `<div data-sb-accordion data-allow-multiple="${allowMultiple ? "true" : "false"}" style="display:flex; flex-direction:column; gap:10px;">
  ${items
    .map((item, index) => {
      const isOpen =
        defaultOpen === String(index) ||
        defaultOpen === String(index + 1) ||
        (!defaultOpen && index === 0);
      return `<div data-sb-accordion-item class="${isOpen ? "is-open" : ""}" style="border:1px solid ${escapeAttribute(toStringValue(content.borderColor, "#e5e7eb"))}; border-radius:14px; overflow:hidden; background:#ffffff;">
  <button type="button" data-sb-accordion-trigger aria-expanded="${isOpen ? "true" : "false"}" style="width:100%; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 16px; border:0; background:#f8fafc; color:${escapeAttribute(toStringValue(content.headingColor, "#111111"))}; text-align:left; font-weight:600; cursor:pointer;">
    <span>${escapeHtml(toStringValue(item.question, `Question ${index + 1}`))}</span>
    <span aria-hidden="true">${isOpen ? "-" : "+"}</span>
  </button>
  <div data-sb-accordion-panel${isOpen ? "" : " hidden"} style="padding:16px; color:${escapeAttribute(toStringValue(content.contentColor, "#555555"))}; line-height:1.7;">
    ${sanitizeCustomMarkup(item.answer || "")}
  </div>
</div>`;
    })
    .join("\n  ")}
</div>`;
    }

    case "tabs": {
      const tabs = toItems<Record<string, unknown>>(content.tabs);
      const activeColor = toStringValue(content.activeColor, "#111111");
      const inactiveColor = toStringValue(content.inactiveColor, "#64748b");
      return `<div data-sb-tabs data-active-color="${escapeAttribute(activeColor)}" data-inactive-color="${escapeAttribute(inactiveColor)}">
  <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
    ${tabs
      .map(
        (tab, index) =>
          `<button type="button" data-sb-tab-button="${wrapperId}-tab-${index}" style="padding:10px 14px; border:0; border-bottom:2px solid ${
            index === 0 ? activeColor : "transparent"
          }; background:transparent; color:${
            index === 0 ? activeColor : inactiveColor
          }; font-weight:600; cursor:pointer;">${escapeHtml(
            toStringValue(tab.label, `Tab ${index + 1}`),
          )}</button>`,
      )
      .join("\n    ")}
  </div>
  ${tabs
    .map(
      (tab, index) =>
        `<div data-sb-tab-panel="${wrapperId}-tab-${index}"${
          index === 0 ? "" : " hidden"
        } style="border:1px solid #e2e8f0; border-radius:16px; padding:16px; background:#ffffff;">${sanitizeCustomMarkup(
          tab.content || "<p>Tab content</p>",
        )}</div>`,
    )
    .join("\n  ")}
</div>`;
    }

    case "countdown": {
      const targetDate = toStringValue(content.targetDate);
      const expiredText = toStringValue(
        content.expiredText,
        "This offer has ended",
      );
      const redirectUrl = toStringValue(content.redirectUrl).trim();
      const units = [
        toBoolean(content.showDays, true) ? "days" : null,
        toBoolean(content.showHours, true) ? "hours" : null,
        toBoolean(content.showMinutes, true) ? "minutes" : null,
        toBoolean(content.showSeconds, true) ? "seconds" : null,
      ].filter(Boolean) as string[];

      return `<div data-sb-countdown data-target-date="${escapeAttribute(targetDate)}" data-expired-text="${escapeAttribute(expiredText)}" data-redirect-url="${escapeAttribute(redirectUrl)}" style="display:flex; flex-wrap:wrap; gap:10px;">
  ${units
    .map(
      (unit) =>
        `<div style="min-width:72px; padding:14px; border-radius:14px; background:#ffffff; border:1px solid #e2e8f0; text-align:center;">
    <div data-sb-count-part="${unit}" style="font-size:22px; font-weight:700; color:${escapeAttribute(toStringValue(content.numberColor, "#111111"))};">00</div>
    <div style="margin-top:4px; font-size:11px; color:${escapeAttribute(toStringValue(content.labelColor, "#888888"))}; text-transform:uppercase; letter-spacing:0.08em;">${escapeHtml(
      unit,
    )}</div>
  </div>`,
    )
    .join("\n  ")}
  <div data-sb-count-expired hidden style="width:100%; font-size:13px; color:#64748b;">${escapeHtml(expiredText)}</div>
</div>`;
    }

    case "form": {
      const fields = toItems<Record<string, unknown>>(content.fields);
      return `<form data-sb-form data-email-recipient="${escapeAttribute(toStringValue(content.emailRecipient))}" style="display:flex; flex-direction:column; gap:10px;">
  ${fields
    .map((field, index) => {
      const type = toStringValue(field.type, "text");
      const label = escapeHtml(
        toStringValue(field.label, `Field ${index + 1}`),
      );
      const placeholder = escapeAttribute(toStringValue(field.placeholder));
      const required = toBoolean(field.required) ? " required" : "";
      const inputStyles = `width:100%; padding:11px 12px; border-radius:10px; border:1px solid ${escapeAttribute(
        toStringValue(content.inputBorderColor, "#d1d5db"),
      )}; box-sizing:border-box;`;

      if (type === "textarea") {
        return `<div style="display:flex; flex-direction:column; gap:4px;">
    <label style="font-size:12px; color:#334155;">${label}</label>
    <textarea placeholder="${placeholder}"${required} style="${inputStyles} min-height:120px;"></textarea>
  </div>`;
      }

      return `<div style="display:flex; flex-direction:column; gap:4px;">
    <label style="font-size:12px; color:#334155;">${label}</label>
    <input type="${escapeAttribute(type || "text")}" placeholder="${placeholder}"${required} style="${inputStyles}">
  </div>`;
    })
    .join("\n  ")}
  <button type="submit" style="margin-top:4px; padding:12px 16px; border:0; border-radius:10px; background:${escapeAttribute(toStringValue(content.buttonColor, "#111111"))}; color:${escapeAttribute(toStringValue(content.buttonTextColor, "#ffffff"))}; font-weight:600;">${escapeHtml(
    toStringValue(content.submitText, "Submit"),
  )}</button>
  <div data-sb-form-success hidden style="font-size:13px; color:#0f766e;">${escapeHtml(
    toStringValue(content.successMessage, "Thank you!"),
  )}</div>
</form>`;
    }

    case "slider": {
      const slides = toItems<Record<string, unknown>>(content.slides);
      const height = Math.max(
        180,
        toNumber(getResponsiveValue(content.height, 420), 420),
      );
      const showDots = toBoolean(content.showDots, true);
      const showArrows = toBoolean(content.showArrows, true);
      const autoplay = toBoolean(content.autoplay, true);
      const autoplaySpeed = Math.max(1200, toNumber(content.autoplaySpeed, 5000));

      const normalizedSlides = slides.length
        ? slides
        : [
            {
              heading: "Slide one",
              text: "Add slideshow content in Shop Builder.",
              image: "",
            },
          ];

      return `<div data-sb-slider data-autoplay="${autoplay ? "true" : "false"}" data-speed="${autoplaySpeed}">
  <div style="position:relative; min-height:${height}px; border-radius:18px; overflow:hidden; background:#0f172a; color:#ffffff;">
    ${normalizedSlides
      .map((slide, index) => {
        const image = toStringValue(
          slide.image || slide.imageUrl || slide.src,
        ).trim();
        const background = image
          ? `linear-gradient(180deg, rgba(15,23,42,0.18), rgba(15,23,42,0.82)), url('${escapeCssUrl(
              image,
            )}') center/cover no-repeat`
          : "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)";
        return `<div data-sb-slider-slide class="${
          index === 0 ? "is-active" : ""
        }" style="position:${index === 0 ? "relative" : "absolute"}; inset:0; display:${
          index === 0 ? "flex" : "none"
        }; align-items:flex-end; min-height:${height}px; padding:28px; background:${background};">
      <div style="max-width:560px;">
        <div style="font-size:clamp(28px, 4vw, 44px); font-weight:700; line-height:1.08;">${escapeHtml(
          toStringValue(slide.heading || slide.title, `Slide ${index + 1}`),
        )}</div>
        ${
          toStringValue(slide.text || slide.subtitle).trim()
            ? `<div style="margin-top:12px; font-size:15px; line-height:1.7; color:rgba(255,255,255,0.92);">${escapeHtml(
                toStringValue(slide.text || slide.subtitle),
              )}</div>`
            : ""
        }
      </div>
    </div>`;
      })
      .join("\n    ")}
    ${
      showArrows
        ? `<button type="button" data-sb-slider-prev aria-label="Previous slide" style="position:absolute; top:50%; left:14px; transform:translateY(-50%); width:42px; height:42px; border-radius:999px; border:0; background:rgba(255,255,255,0.18); color:#ffffff; cursor:pointer;">&#10094;</button>
    <button type="button" data-sb-slider-next aria-label="Next slide" style="position:absolute; top:50%; right:14px; transform:translateY(-50%); width:42px; height:42px; border-radius:999px; border:0; background:rgba(255,255,255,0.18); color:#ffffff; cursor:pointer;">&#10095;</button>`
        : ""
    }
  </div>
  ${
    showDots
      ? `<div style="display:flex; justify-content:center; gap:6px; margin-top:10px;">
    ${normalizedSlides
      .map(
        (_slide, index) =>
          `<button type="button" data-sb-slider-dot aria-label="Go to slide ${
            index + 1
          }" style="width:10px; height:10px; border-radius:999px; border:0; background:#0f172a; opacity:${
            index === 0 ? "1" : "0.35"
          }; cursor:pointer;"></button>`,
      )
      .join("\n    ")}
  </div>`
      : ""
  }
</div>`;
    }

    case "product_card": {
      const productHandle = toStringValue(content.productHandle).trim();
      if (!productHandle) {
        return `<div style="padding:18px; border:1px dashed #cbd5e1; border-radius:18px; color:#64748b;">Add a product handle in Shop Builder to show a real product.</div>`;
      }

      return `{% assign sb_product = all_products['${productHandle}'] %}
{% if sb_product != blank %}
  <div style="border:1px solid #e2e8f0; border-radius:18px; overflow:hidden; background:#ffffff;">
    <a href="{{ sb_product.url }}" style="display:block; color:inherit; text-decoration:none;">
      {% if sb_product.featured_image != blank %}
        <div style="aspect-ratio:${getAspectRatio(
          toStringValue(content.imageRatio, "square"),
        )}; overflow:hidden; background:#f8fafc;">
          <img src="{{ sb_product.featured_image | image_url: width: 1200 }}" alt="{{ sb_product.title | escape }}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>
      {% endif %}
      <div style="padding:16px;">
        ${
          toBoolean(content.showVendor)
            ? `<div style="font-size:12px; color:#64748b;">{{ sb_product.vendor }}</div>`
            : ""
        }
        ${
          toBoolean(content.showTitle, true)
            ? `<div style="margin-top:4px; font-size:18px; font-weight:600; color:#0f172a;">{{ sb_product.title }}</div>`
            : ""
        }
        ${
          toBoolean(content.showRating)
            ? `<div style="margin-top:8px; color:#f59e0b; letter-spacing:0.12em;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>`
            : ""
        }
        ${
          toBoolean(content.showPrice, true)
            ? `<div style="margin-top:8px; color:#334155;">{{ sb_product.price | money }}</div>`
            : ""
        }
      </div>
    </a>
    ${
      toBoolean(content.showAddToCart, true)
        ? `{% if sb_product.selected_or_first_available_variant != blank %}
      <form method="post" action="/cart/add" style="padding:0 16px 16px;">
        <input type="hidden" name="id" value="{{ sb_product.selected_or_first_available_variant.id }}">
        <button type="submit" style="width:100%; padding:12px 16px; border:0; border-radius:999px; background:#111111; color:#ffffff; font-weight:600; cursor:pointer;">Add to cart</button>
      </form>
    {% endif %}`
        : ""
    }
  </div>
{% else %}
  <div style="padding:18px; border:1px dashed #cbd5e1; border-radius:18px; color:#64748b;">Product handle <strong>${escapeHtml(
        productHandle,
      )}</strong> was not found in this store.</div>
{% endif %}`;
    }

    case "product_grid": {
      const collectionHandle = toStringValue(
        content.collectionId || content.collectionHandle,
      ).trim();
      if (!collectionHandle) {
        return `<div style="padding:18px; border:1px dashed #cbd5e1; border-radius:18px; color:#64748b;">Add a collection handle in Shop Builder to show products here.</div>`;
      }

      const columns = Math.max(
        1,
        Math.min(4, toNumber(getResponsiveValue(content.columns, 3), 3)),
      );
      const tabletColumns = isRecord(content.columns)
        ? Math.max(1, Math.min(4, toNumber(content.columns.tablet, columns)))
        : Math.min(2, columns);
      const mobileColumns = isRecord(content.columns)
        ? Math.max(1, Math.min(4, toNumber(content.columns.mobile, 1)))
        : 1;
      const limit = Math.max(1, Math.min(24, toNumber(content.limit, 8)));

      return `{% assign sb_collection = collections['${collectionHandle}'] %}
{% if sb_collection != blank %}
  <div data-sb-grid style="--sb-grid-columns:${columns}; --sb-grid-columns-tablet:${tabletColumns}; --sb-grid-columns-mobile:${mobileColumns};">
    {% for product in sb_collection.products limit: ${limit} %}
      <a href="{{ product.url }}" style="display:block; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; background:#ffffff; text-decoration:none; color:inherit;">
        {% if product.featured_image != blank %}
          <div style="aspect-ratio:1 / 1; overflow:hidden; background:#f8fafc;">
            <img src="{{ product.featured_image | image_url: width: 900 }}" alt="{{ product.title | escape }}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
          </div>
        {% endif %}
        <div style="padding:14px;">
          <div style="font-weight:600; color:#0f172a;">{{ product.title }}</div>
          <div style="margin-top:6px; color:#334155;">{{ product.price | money }}</div>
        </div>
      </a>
    {% endfor %}
  </div>
  ${
    toBoolean(content.showPagination)
      ? `<div style="margin-top:14px; text-align:center;">
    <a href="{{ sb_collection.url }}" style="display:inline-flex; align-items:center; justify-content:center; padding:12px 18px; border-radius:999px; border:1px solid #cbd5e1; color:#0f172a; text-decoration:none; font-weight:600;">View collection</a>
  </div>`
      : ""
  }
{% else %}
  <div style="padding:18px; border:1px dashed #cbd5e1; border-radius:18px; color:#64748b;">Collection handle <strong>${escapeHtml(
        collectionHandle,
      )}</strong> was not found in this store.</div>
{% endif %}`;
    }

    case "collection": {
      const collectionHandle = toStringValue(content.collectionHandle).trim();
      if (!collectionHandle) {
        return `<div style="padding:18px; border:1px dashed #cbd5e1; border-radius:18px; color:#64748b;">Add a collection handle in Shop Builder to show this collection.</div>`;
      }

      const columns = Math.max(
        1,
        Math.min(4, toNumber(getResponsiveValue(content.columns, 3), 3)),
      );
      const tabletColumns = isRecord(content.columns)
        ? Math.max(1, Math.min(4, toNumber(content.columns.tablet, columns)))
        : Math.min(2, columns);
      const mobileColumns = isRecord(content.columns)
        ? Math.max(1, Math.min(4, toNumber(content.columns.mobile, 1)))
        : 1;
      const limit = Math.max(1, Math.min(24, toNumber(content.limit, 6)));

      return `{% assign sb_collection = collections['${collectionHandle}'] %}
{% if sb_collection != blank %}
  <div style="display:flex; flex-direction:column; gap:18px;">
    <a href="{{ sb_collection.url }}" style="display:block; border:1px solid #e2e8f0; border-radius:18px; overflow:hidden; background:#ffffff; text-decoration:none; color:inherit;">
      {% if sb_collection.image != blank %}
        <div style="aspect-ratio:${getAspectRatio(
          toStringValue(content.imageRatio, "square"),
        )}; overflow:hidden; background:#f8fafc;">
          <img src="{{ sb_collection.image | image_url: width: 1200 }}" alt="{{ sb_collection.title | escape }}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>
      {% endif %}
      <div style="padding:18px;">
        ${
          toBoolean(content.showTitle, true)
            ? `<div style="font-size:22px; font-weight:700; color:#0f172a;">{{ sb_collection.title }}</div>`
            : ""
        }
        ${
          toBoolean(content.showProductCount)
            ? `<div style="margin-top:8px; color:#64748b;">{{ sb_collection.products_count }} products</div>`
            : ""
        }
      </div>
    </a>
    <div data-sb-grid style="--sb-grid-columns:${columns}; --sb-grid-columns-tablet:${tabletColumns}; --sb-grid-columns-mobile:${mobileColumns};">
      {% for product in sb_collection.products limit: ${limit} %}
        <a href="{{ product.url }}" style="display:block; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; background:#ffffff; text-decoration:none; color:inherit;">
          {% if product.featured_image != blank %}
            <div style="aspect-ratio:1 / 1; overflow:hidden; background:#f8fafc;">
              <img src="{{ product.featured_image | image_url: width: 900 }}" alt="{{ product.title | escape }}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block;">
            </div>
          {% endif %}
          <div style="padding:14px;">
            <div style="font-weight:600; color:#0f172a;">{{ product.title }}</div>
            <div style="margin-top:6px; color:#334155;">{{ product.price | money }}</div>
          </div>
        </a>
      {% endfor %}
    </div>
  </div>
{% else %}
  <div style="padding:18px; border:1px dashed #cbd5e1; border-radius:18px; color:#64748b;">Collection handle <strong>${escapeHtml(
        collectionHandle,
      )}</strong> was not found in this store.</div>
{% endif %}`;
    }

    default:
      return `<div style="padding:14px; border-radius:14px; background:#fff7ed; color:#9a3412;">Unsupported builder element type: ${escapeHtml(
        element.type,
      )}</div>`;
  }
}

export function buildThemeSectionLiquid({
  section,
  displayName,
  containerWidth,
}: {
  section: Section;
  displayName: string;
  containerWidth: number;
}) {
  const schema = buildSectionSchema({ displayName, section, containerWidth });
  const backgroundImage = toStringValue(section.settings.backgroundImage).trim();
  const sectionRootStyles = joinStyles([
    "background-color:{{ section.settings.sb_background_color }};",
    `padding:{{ section.settings.sb_padding_top }}px ${section.settings.paddingRight.desktop}px {{ section.settings.sb_padding_bottom }}px ${section.settings.paddingLeft.desktop}px;`,
    `margin:${section.settings.marginTop.desktop}px 0 ${section.settings.marginBottom.desktop}px;`,
    section.settings.minHeight.desktop
      ? `min-height:${section.settings.minHeight.desktop}px;`
      : "",
    section.settings.borderWidth > 0
      ? `border:${section.settings.borderWidth}px ${section.settings.borderStyle} ${section.settings.borderColor};`
      : "",
    section.settings.borderRadius > 0
      ? `border-radius:${section.settings.borderRadius}px;`
      : "",
    backgroundImage
      ? `background-image:url('${escapeCssUrl(backgroundImage)}'); background-size:${escapeAttribute(section.settings.backgroundSize || "cover")}; background-position:${escapeAttribute(section.settings.backgroundPosition || "center")}; background-repeat:no-repeat;`
      : "",
  ]);
  const sectionAnimationAttributes =
    section.settings.animation.type !== "none"
      ? ` data-sb-animation="${escapeAttribute(section.settings.animation.type)}" data-sb-animation-once="${section.settings.animation.once ? "true" : "false"}" style="${escapeAttribute(joinStyles([sectionRootStyles, `--sb-animation-duration:${section.settings.animation.duration}ms;`, `--sb-animation-delay:${section.settings.animation.delay}ms;`]))}"`
      : ` style="${escapeAttribute(sectionRootStyles)}"`;

  const columnsMarkup = section.columns
    .map((column, columnIndex) => {
      const columnStyles = joinStyles([
        `--sb-column-width-desktop:${column.width.desktop}%;`,
        `--sb-column-width-tablet:${column.width.tablet}%;`,
        `--sb-column-width-mobile:${column.width.mobile}%;`,
        "width:var(--sb-column-width-desktop);",
        "display:flex;",
        "flex-direction:column;",
        `justify-content:${getColumnAlignment(column.settings.verticalAlign)};`,
        `padding:${column.settings.paddingTop.desktop}px ${column.settings.paddingRight.desktop}px ${column.settings.paddingBottom.desktop}px ${column.settings.paddingLeft.desktop}px;`,
        column.settings.backgroundColor !== "transparent"
          ? `background:${column.settings.backgroundColor};`
          : "",
        "box-sizing:border-box;",
        "min-width:0;",
      ]);

      const elementsMarkup = column.elements
        .map((element, elementIndex) =>
          buildElementMarkup({
            element,
            columnIndex,
            elementIndex,
          }),
        )
        .join("\n");

      return `<div class="sb-native-column sb-native-column--${columnIndex + 1}" style="${escapeAttribute(columnStyles)}">
  ${elementsMarkup}
</div>`;
    })
    .join("\n");

  const customClass = toStringValue(section.settings.customClass).trim();
  const customId = toStringValue(section.settings.customId).trim();
  const customCss = toStringValue(section.settings.customCss).trim();

  return `
<section id="shopbuilder-section-{{ section.id }}"${customId ? ` data-custom-id="${escapeAttribute(customId)}"` : ""} class="shopbuilder-native-section${customClass ? ` ${escapeAttribute(customClass)}` : ""}"${sectionAnimationAttributes}>
  <div class="sb-native-container" style="max-width:{% if section.settings.sb_full_width %}100%{% else %}{{ section.settings.sb_container_width }}px{% endif %}; margin:0 auto;">
    <div class="sb-native-columns" style="display:flex; flex-wrap:wrap; align-items:stretch;">
      ${columnsMarkup}
    </div>
  </div>
</section>

<style>
  #shopbuilder-section-{{ section.id }} * {
    box-sizing: border-box;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-grid] {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(var(--sb-grid-columns, 1), minmax(0, 1fr));
  }

  #shopbuilder-section-{{ section.id }} [data-sb-accordion-panel][hidden],
  #shopbuilder-section-{{ section.id }} [data-sb-tab-panel][hidden] {
    display: none !important;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-slider-slide] {
    display: none;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-slider-slide].is-active {
    display: flex;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation],
  #shopbuilder-section-{{ section.id }}[data-sb-animation] {
    opacity: 0;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation].sb-is-animated,
  #shopbuilder-section-{{ section.id }}[data-sb-animation].sb-is-animated {
    opacity: 1;
    animation-duration: var(--sb-animation-duration, 600ms);
    animation-delay: var(--sb-animation-delay, 0ms);
    animation-fill-mode: both;
    animation-timing-function: ease;
    will-change: opacity, transform;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation="fadeIn"].sb-is-animated,
  #shopbuilder-section-{{ section.id }}[data-sb-animation="fadeIn"].sb-is-animated {
    animation-name: sb-fade-in;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation="fadeInUp"].sb-is-animated,
  #shopbuilder-section-{{ section.id }}[data-sb-animation="fadeInUp"].sb-is-animated {
    animation-name: sb-fade-in-up;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation="fadeInDown"].sb-is-animated,
  #shopbuilder-section-{{ section.id }}[data-sb-animation="fadeInDown"].sb-is-animated {
    animation-name: sb-fade-in-down;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation="slideInLeft"].sb-is-animated,
  #shopbuilder-section-{{ section.id }}[data-sb-animation="slideInLeft"].sb-is-animated {
    animation-name: sb-slide-in-left;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation="slideInRight"].sb-is-animated,
  #shopbuilder-section-{{ section.id }}[data-sb-animation="slideInRight"].sb-is-animated {
    animation-name: sb-slide-in-right;
  }

  #shopbuilder-section-{{ section.id }} [data-sb-animation="zoomIn"].sb-is-animated,
  #shopbuilder-section-{{ section.id }}[data-sb-animation="zoomIn"].sb-is-animated {
    animation-name: sb-zoom-in;
  }

  @keyframes sb-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes sb-fade-in-up {
    from { opacity: 0; transform: translate3d(0, 24px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes sb-fade-in-down {
    from { opacity: 0; transform: translate3d(0, -24px, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes sb-slide-in-left {
    from { opacity: 0; transform: translate3d(-32px, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes sb-slide-in-right {
    from { opacity: 0; transform: translate3d(32px, 0, 0); }
    to { opacity: 1; transform: translate3d(0, 0, 0); }
  }

  @keyframes sb-zoom-in {
    from { opacity: 0; transform: scale3d(0.92, 0.92, 1); }
    to { opacity: 1; transform: scale3d(1, 1, 1); }
  }

  ${customCss ? `#shopbuilder-section-{{ section.id }} { ${customCss} }` : ""}

  @media screen and (max-width: 989px) {
    #shopbuilder-section-{{ section.id }} .sb-native-column {
      width: var(--sb-column-width-tablet, var(--sb-column-width-desktop)) !important;
    }

    #shopbuilder-section-{{ section.id }} [data-sb-grid] {
      grid-template-columns: repeat(var(--sb-grid-columns-tablet, var(--sb-grid-columns, 1)), minmax(0, 1fr));
    }
  }

  @media screen and (max-width: 749px) {
    #shopbuilder-section-{{ section.id }} .sb-native-column {
      width: var(--sb-column-width-mobile, 100%) !important;
    }

    #shopbuilder-section-{{ section.id }} [data-sb-grid] {
      grid-template-columns: repeat(var(--sb-grid-columns-mobile, 1), minmax(0, 1fr));
    }
  }
</style>

<script>
  (() => {
    const root = document.getElementById("shopbuilder-section-{{ section.id }}");
    if (!root) return;
    const animatedNodes = [
      root.matches("[data-sb-animation]") ? root : null,
      ...Array.from(root.querySelectorAll("[data-sb-animation]")),
    ].filter(Boolean);

    if (animatedNodes.length) {
      if (typeof IntersectionObserver !== "function") {
        animatedNodes.forEach((node) => node.classList.add("sb-is-animated"));
      } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const node = entry.target;
            node.classList.add("sb-is-animated");
            if (node.getAttribute("data-sb-animation-once") !== "false") {
              observer.unobserve(node);
            }
          });
        },
        { threshold: 0.12 },
      );

      animatedNodes.forEach((node) => observer.observe(node));
      }
    }

    root.querySelectorAll("[data-sb-accordion]").forEach((accordion) => {
      const allowMultiple =
        accordion.getAttribute("data-allow-multiple") === "true";
      const items = Array.from(
        accordion.querySelectorAll("[data-sb-accordion-item]"),
      );

      accordion
        .querySelectorAll("[data-sb-accordion-trigger]")
        .forEach((trigger) => {
          trigger.addEventListener("click", () => {
            const item = trigger.closest("[data-sb-accordion-item]");
            if (!item) return;

            const icon = trigger.querySelector("span:last-child");
            const nextOpen = !item.classList.contains("is-open");

            if (!allowMultiple) {
              items.forEach((candidate) => {
                candidate.classList.remove("is-open");
                const panel = candidate.querySelector(
                  "[data-sb-accordion-panel]",
                );
                const button = candidate.querySelector(
                  "[data-sb-accordion-trigger]",
                );
                const buttonIcon = button?.querySelector("span:last-child");
                if (panel) panel.hidden = true;
                if (button) button.setAttribute("aria-expanded", "false");
                if (buttonIcon) buttonIcon.textContent = "+";
              });
            }

            item.classList.toggle("is-open", nextOpen);
            const panel = item.querySelector("[data-sb-accordion-panel]");
            if (panel) panel.hidden = !nextOpen;
            trigger.setAttribute("aria-expanded", String(nextOpen));
            if (icon) icon.textContent = nextOpen ? "-" : "+";
          });
        });
    });

    root.querySelectorAll("[data-sb-tabs]").forEach((tabs) => {
      const buttons = Array.from(tabs.querySelectorAll("[data-sb-tab-button]"));
      const panels = Array.from(tabs.querySelectorAll("[data-sb-tab-panel]"));
      const activeColor = tabs.getAttribute("data-active-color") || "#111111";
      const inactiveColor =
        tabs.getAttribute("data-inactive-color") || "#64748b";

      const activate = (tabId) => {
        buttons.forEach((button) => {
          const isActive =
            button.getAttribute("data-sb-tab-button") === tabId;
          button.style.color = isActive ? activeColor : inactiveColor;
          button.style.borderBottomColor = isActive
            ? activeColor
            : "transparent";
        });

        panels.forEach((panel) => {
          panel.hidden = panel.getAttribute("data-sb-tab-panel") !== tabId;
        });
      };

      const initialTab =
        buttons[0]?.getAttribute("data-sb-tab-button") || null;
      if (initialTab) activate(initialTab);

      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const tabId = button.getAttribute("data-sb-tab-button");
          if (tabId) activate(tabId);
        });
      });
    });

    root.querySelectorAll("[data-sb-countdown]").forEach((countdown) => {
      const targetDate = countdown.getAttribute("data-target-date");
      const expiredText = countdown.getAttribute("data-expired-text") || "";
      const redirectUrl = countdown.getAttribute("data-redirect-url") || "";
      if (!targetDate) return;

      const target = new Date(targetDate).getTime();
      const parts = Array.from(
        countdown.querySelectorAll("[data-sb-count-part]"),
      );
      const expiredNode = countdown.querySelector("[data-sb-count-expired]");
      let hasRedirected = false;

      const render = () => {
        const distance = Math.max(0, target - Date.now());
        const values = {
          days: Math.floor(distance / 86400000),
          hours: Math.floor((distance % 86400000) / 3600000),
          minutes: Math.floor((distance % 3600000) / 60000),
          seconds: Math.floor((distance % 60000) / 1000),
        };

        parts.forEach((part) => {
          const key = part.getAttribute("data-sb-count-part");
          const value = key && key in values ? values[key] : 0;
          part.textContent = String(value).padStart(2, "0");
        });

        if (distance <= 0) {
          if (expiredNode && expiredText) expiredNode.hidden = false;
          if (redirectUrl && !hasRedirected) {
            hasRedirected = true;
            window.location.assign(redirectUrl);
          }
        }
      };

      render();
      setInterval(render, 1000);
    });

    root.querySelectorAll("[data-sb-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const success = form.querySelector("[data-sb-form-success]");
        if (success) success.hidden = false;
      });
    });

    root.querySelectorAll("[data-sb-slider]").forEach((slider) => {
      const slides = Array.from(
        slider.querySelectorAll("[data-sb-slider-slide]"),
      );
      const dots = Array.from(slider.querySelectorAll("[data-sb-slider-dot]"));
      const prev = slider.querySelector("[data-sb-slider-prev]");
      const next = slider.querySelector("[data-sb-slider-next]");
      if (!slides.length) return;

      let current = 0;
      let timer = null;
      const autoplay = slider.getAttribute("data-autoplay") !== "false";
      const speed = Number(slider.getAttribute("data-speed") || 5000);

      const showSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
          dot.style.opacity = dotIndex === current ? "1" : "0.35";
        });
      };

      const startTimer = () => {
        if (!autoplay || slides.length < 2) return;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          showSlide(current + 1);
        }, Math.max(speed, 1200));
      };

      const stopTimer = () => {
        if (timer) clearInterval(timer);
      };

      dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          showSlide(index);
          startTimer();
        });
      });

      prev?.addEventListener("click", () => {
        showSlide(current - 1);
        startTimer();
      });

      next?.addEventListener("click", () => {
        showSlide(current + 1);
        startTimer();
      });

      slider.addEventListener("mouseenter", stopTimer);
      slider.addEventListener("mouseleave", startTimer);

      showSlide(0);
      startTimer();
    });
  })();
</script>

{% schema %}
${JSON.stringify(schema, null, 2)}
{% endschema %}
`.trim();
}

function stripThemeSchema(liquid: string) {
  return liquid
    .replace(/\s*\{% schema %\}[\s\S]*?\{% endschema %\}\s*$/u, "")
    .trim();
}

export function buildThemeAppProxyLiquid({
  section,
  displayName,
  containerWidth,
  instanceId,
}: {
  section: Section;
  displayName: string;
  containerWidth: number;
  instanceId?: string;
}) {
  const rootId = `shopbuilder-proxy-${sanitizeClassName(
    instanceId || displayName || "section",
  )}`.slice(0, 80);
  const nativeLiquid = buildThemeSectionLiquid({
    section,
    displayName,
    containerWidth,
  });

  return stripThemeSchema(nativeLiquid)
    .replaceAll("{{ section.id }}", rootId)
    .replaceAll(
      "{{ section.settings.sb_background_color }}",
      toStringValue(section.settings.backgroundColor.desktop, "#ffffff"),
    )
    .replaceAll(
      "{{ section.settings.sb_padding_top }}",
      String(toNumber(section.settings.paddingTop.desktop, 40)),
    )
    .replaceAll(
      "{{ section.settings.sb_padding_bottom }}",
      String(toNumber(section.settings.paddingBottom.desktop, 40)),
    )
    .replaceAll(
      "{% if section.settings.sb_full_width %}100%{% else %}{{ section.settings.sb_container_width }}px{% endif %}",
      section.settings.fullWidth ? "100%" : `${Math.max(320, containerWidth)}px`,
    );
}
