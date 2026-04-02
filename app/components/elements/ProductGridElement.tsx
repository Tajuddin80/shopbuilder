import {
  getElementContent,
  PlaceholderGrid,
  type ElementComponentProps,
} from "./shared";

export function ProductGridElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  return (
    <div>
      {content.collectionId || content.tag ? (
        <div style={{ marginBottom: 10, fontSize: 12, color: "#64748b" }}>
          Source: {content.collectionId || content.tag}
        </div>
      ) : null}
      <PlaceholderGrid
        label="Product"
        columns={Math.min(content.columns?.desktop || 3, 4)}
      />
    </div>
  );
}
