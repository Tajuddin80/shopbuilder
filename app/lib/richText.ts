export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function plainTextToHtml(value?: string | null, fallback = "") {
  const source = String(value || "").trim();
  const normalized = source || fallback.trim();

  if (!normalized) return "";

  return normalized
    .split(/\n\s*\n/)
    .map((paragraph) =>
      `<p>${paragraph
        .split(/\r?\n/)
        .map((line) => escapeHtml(line.trim()))
        .join("<br>")}</p>`,
    )
    .join("");
}

export function richTextMarkup(
  value: { html?: string | null; text?: string | null },
  fallback = "",
) {
  const html = String(value.html || "").trim();
  if (html) return html;
  return plainTextToHtml(value.text, fallback);
}

export function richTextToPlainText(value?: string | null) {
  const html = String(value || "").trim();
  if (!html) return "";

  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<\/div>\s*<div>/gi, "\n")
    .replace(/<\/li>\s*<li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
