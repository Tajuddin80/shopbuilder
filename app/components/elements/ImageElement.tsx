import {
  getElementContent,
  getElementSettings,
  type ElementComponentProps,
  responsiveValue,
} from "./shared";

export function ImageElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const settings = getElementSettings(element);
  const widthPx = responsiveValue(content.widthPx, null);
  const heightPx = responsiveValue(content.heightPx, null);
  const image = (
    <img
      src={content.src || "https://placehold.co/1200x700"}
      alt={content.alt || ""}
      style={{
        width: widthPx ? `${widthPx}px` : "100%",
        maxWidth: "100%",
        height: heightPx ? `${heightPx}px` : "auto",
        display: "block",
        objectFit: content.objectFit || "cover",
        borderRadius: settings.borderRadius || 0,
      }}
    />
  );

  if (content.linkUrl) {
    return (
      <a
        href={content.linkUrl}
        target={content.linkTarget || "_self"}
        onClick={(event) => event.preventDefault()}
        style={{ display: "inline-block", maxWidth: "100%" }}
      >
        {image}
      </a>
    );
  }

  return image;
}
