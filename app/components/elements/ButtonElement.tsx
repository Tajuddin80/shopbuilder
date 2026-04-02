import {
  getElementContent,
  responsiveValue,
  type ElementComponentProps,
} from "./shared";

export function ButtonElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const padding =
    content.size === "small"
      ? "8px 16px"
      : content.size === "large"
        ? "16px 36px"
        : "12px 24px";
  const isOutline = content.style === "outline";

  return (
    <a
      href={content.url || "#"}
      target={content.target || "_self"}
      onClick={(event) => event.preventDefault()}
      style={{
        display: "inline-block",
        textDecoration: "none",
        background: isOutline
          ? "transparent"
          : content.backgroundColor || "#111111",
        color: isOutline
          ? content.textColor === "#fff" || content.textColor === "#ffffff"
            ? content.borderColor || "#111111"
            : content.textColor || content.borderColor || "#111111"
          : content.textColor || "#ffffff",
        border: `2px solid ${content.borderColor || "#111111"}`,
        borderRadius: 8,
        padding,
        fontWeight: content.fontWeight || 600,
        fontSize: responsiveValue(content.fontSize, 16),
        fontFamily: content.fontFamily || "inherit",
      }}
    >
      {content.text || "Click here"}
    </a>
  );
}
