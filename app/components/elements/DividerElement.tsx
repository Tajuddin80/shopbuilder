import { getElementContent, type ElementComponentProps } from "./shared";

export function DividerElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const justifyContent =
    content.alignment === "left"
      ? "flex-start"
      : content.alignment === "right"
        ? "flex-end"
        : "center";

  return (
    <div style={{ display: "flex", justifyContent }}>
      <div
        style={{
          width: `${content.width || 100}%`,
          borderTop: `${content.thickness || 1}px ${content.style || "solid"} ${content.color || "#e5e7eb"}`,
        }}
      />
    </div>
  );
}
