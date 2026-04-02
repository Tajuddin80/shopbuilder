import {
  getElementContent,
  getElementSettings,
  type ElementComponentProps,
} from "./shared";

export function ImageElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const settings = getElementSettings(element);
  const image = (
    <img
      src={content.src || "https://placehold.co/1200x700"}
      alt={content.alt || ""}
      style={{
        width: "100%",
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
        style={{ display: "block" }}
      >
        {image}
      </a>
    );
  }

  return image;
}
