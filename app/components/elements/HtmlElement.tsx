import {
  getElementContent,
  getElementSettings,
  type ElementComponentProps,
} from "./shared";

export function HtmlElement({
  element,
  previewId = "html-preview",
}: ElementComponentProps) {
  const content = getElementContent(element);
  const settings = getElementSettings(element);

  return (
    <>
      {settings.customCss ? (
        <style>{`#${previewId}{${settings.customCss}}`}</style>
      ) : null}
      <div
        id={previewId}
        dangerouslySetInnerHTML={{ __html: content.html || "" }}
      />
    </>
  );
}
