import {
  getElementContent,
  type ElementComponentProps,
  responsiveValue,
} from "./shared";

export function HeadingElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const tag = ["h1", "h2", "h3", "h4"].includes(content.tag)
    ? content.tag
    : "h2";
  const fontSize = responsiveValue(content.fontSize, 32);
  const linkedContent = content.linkUrl ? (
    <a
      href={content.linkUrl}
      target={content.linkTarget || "_self"}
      onClick={(event) => event.preventDefault()}
      style={{ color: "inherit", textDecoration: "none" }}
    >
      {content.text || "Your Heading"}
    </a>
  ) : (
    content.text || "Your Heading"
  );

  const commonStyle = {
    margin: 0,
    fontSize,
    color: content.color || "#111111",
    fontWeight: content.fontWeight || 700,
    fontFamily: content.fontFamily || "inherit",
    lineHeight: content.lineHeight || 1.2,
    letterSpacing: content.letterSpacing || 0,
    textTransform: content.textTransform || "none",
  } as const;

  if (tag === "h1") return <h1 style={commonStyle}>{linkedContent}</h1>;
  if (tag === "h3") return <h3 style={commonStyle}>{linkedContent}</h3>;
  if (tag === "h4") return <h4 style={commonStyle}>{linkedContent}</h4>;
  return <h2 style={commonStyle}>{linkedContent}</h2>;
}
