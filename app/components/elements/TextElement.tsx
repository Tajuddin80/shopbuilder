import {
  getElementContent,
  type ElementComponentProps,
  responsiveValue,
} from "./shared";
import { richTextMarkup } from "~/lib/richText";

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
        __html: richTextMarkup(content, "Enter your text here."),
      }}
    />
  );
}
