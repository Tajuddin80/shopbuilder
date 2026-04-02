import {
  getElementContent,
  renderIconGlyph,
  responsiveValue,
  type ElementComponentProps,
} from "./shared";

export function IconElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const size = responsiveValue(content.size, 40);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: 999,
        background: "#f8fafc",
        color: content.color || "#111111",
        fontSize: Math.max(18, size / 2),
      }}
    >
      {renderIconGlyph(content.icon || "star")}
    </div>
  );
}
