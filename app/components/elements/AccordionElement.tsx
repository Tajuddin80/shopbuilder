import {
  getElementContent,
  PreviewCard,
  type ElementComponentProps,
} from "./shared";

export function AccordionElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const items = Array.isArray(content.items) ? content.items : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item: any, index: number) => (
        <PreviewCard key={item.id || index} padding={0}>
          <div
            style={{
              padding: 12,
              fontWeight: 600,
              color: content.headingColor || "#111111",
              background: "#f8fafc",
            }}
          >
            {item.question || "Question"}
          </div>
          <div
            style={{
              padding: 12,
              fontSize: 13,
              color: content.contentColor || "#555555",
            }}
          >
            {item.answer || "Answer"}
          </div>
        </PreviewCard>
      ))}
    </div>
  );
}
