import { getElementContent, type ElementComponentProps } from "./shared";

export function CountdownElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const parts = [
    content.showDays !== false
      ? { key: "days", label: "Days", value: "12" }
      : null,
    content.showHours !== false
      ? { key: "hours", label: "Hours", value: "08" }
      : null,
    content.showMinutes !== false
      ? { key: "minutes", label: "Minutes", value: "42" }
      : null,
    content.showSeconds !== false
      ? { key: "seconds", label: "Seconds", value: "11" }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {parts.map((part) => (
        <div
          key={part.key}
          style={{
            minWidth: 68,
            padding: 12,
            borderRadius: 12,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: content.numberColor || "#111111",
            }}
          >
            {part.value}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: content.labelColor || "#888888",
            }}
          >
            {part.label}
          </div>
        </div>
      ))}
    </div>
  );
}
