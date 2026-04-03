import {
  getElementContent,
  PreviewCard,
  type ElementComponentProps,
} from "./shared";

export function LiquidElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const liquid = String(content.liquid || "").trim();

  if (!liquid || /\{%\s*comment\s*%\}/.test(liquid)) {
    return (
      <PreviewCard background="#0f172a" border="1px solid rgba(148, 163, 184, 0.26)">
        <div style={{ color: "#e2e8f0", fontSize: 12, lineHeight: 1.7 }}>
          Try <code>{"{{ shop.name }}"}</code> or{" "}
          <code>{"{% render 'snippet-name' %}"}</code>.
        </div>
      </PreviewCard>
    );
  }

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
      {liquid}
    </pre>
  );
}
