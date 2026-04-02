import { getElementContent, type ElementComponentProps } from "./shared";

export function LiquidElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  return (
    <pre
      style={{
        margin: 0,
        whiteSpace: "pre-wrap",
        fontSize: 12,
        lineHeight: 1.6,
        color: "#cbd5e1",
        background: "#0f172a",
        padding: 12,
        borderRadius: 10,
        overflowX: "auto",
      }}
    >
      {content.liquid || "{% comment %} Custom Liquid {% endcomment %}"}
    </pre>
  );
}
