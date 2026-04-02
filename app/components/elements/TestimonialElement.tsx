import {
  getElementContent,
  PreviewCard,
  type ElementComponentProps,
} from "./shared";

export function TestimonialElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const items = Array.isArray(content.items) ? content.items : [];
  const columns = Math.min(content.columns?.desktop || 3, 3);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {items.slice(0, 3).map((item: any) => (
        <PreviewCard key={item.id}>
          <div style={{ fontSize: 18, color: "#0f172a" }}>&ldquo;</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "#334155" }}>
            {item.quote}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
            {item.author}
            {item.role ? `, ${item.role}` : ""}
          </div>
        </PreviewCard>
      ))}
    </div>
  );
}
