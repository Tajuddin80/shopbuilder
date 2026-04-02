import { getElementContent, type ElementComponentProps } from "./shared";

export function SocialIconsElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const icons = Array.isArray(content.icons) ? content.icons : [];

  return (
    <div
      style={{
        display: "flex",
        gap: content.gap || 12,
        justifyContent:
          content.alignment === "left"
            ? "flex-start"
            : content.alignment === "right"
              ? "flex-end"
              : "center",
        flexWrap: "wrap",
      }}
    >
      {icons.map((item: any, index: number) => (
        <div
          key={`${item.platform}-${index}`}
          style={{
            width: content.iconSize || 24,
            height: content.iconSize || 24,
            borderRadius: 999,
            background:
              content.iconStyle === "filled"
                ? content.iconColor || "#111111"
                : "transparent",
            color:
              content.iconStyle === "filled"
                ? "#ffffff"
                : content.iconColor || "#111111",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #cbd5e1",
            fontSize: 11,
            textTransform: "uppercase",
          }}
        >
          {String(item.platform || "icon").slice(0, 2)}
        </div>
      ))}
    </div>
  );
}
