import {
  getElementContent,
  type ElementComponentProps,
  responsiveValue,
} from "./shared";

export function TextElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);

  return (
    <div
      style={{
        fontSize: responsiveValue(content.fontSize, 16),
        color: content.color || "#475569",
        fontFamily: content.fontFamily || "inherit",
        lineHeight: content.lineHeight || 1.6,
      }}
      dangerouslySetInnerHTML={{
        __html: content.html || "<p>Enter your text here. Click to edit.</p>",
      }}
    />
  );
}
