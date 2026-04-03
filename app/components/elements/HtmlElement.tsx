import {
  getElementContent,
  getElementSettings,
  PreviewCard,
  type ElementComponentProps,
} from "./shared";

export function HtmlElement({
  element,
  previewId = "html-preview",
}: ElementComponentProps) {
  const content = getElementContent(element);
  const settings = getElementSettings(element);
  const html = String(content.html || "").trim();

  if (!html || /^<!--[\s\S]*-->$/.test(html)) {
    return (
      <PreviewCard background="#f8fafc">
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Paste embed code here, like a review widget, signup form, or iframe.
        </div>
      </PreviewCard>
    );
  }

  return (
    <>
      {settings.customCss ? (
        <style>{`#${previewId}{${settings.customCss}}`}</style>
      ) : null}
      <div id={previewId} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
