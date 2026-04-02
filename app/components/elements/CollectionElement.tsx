import {
  getElementContent,
  PlaceholderGrid,
  type ElementComponentProps,
} from "./shared";

export function CollectionElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  return (
    <div>
      {content.collectionHandle ? (
        <div style={{ marginBottom: 10, fontSize: 12, color: "#64748b" }}>
          Collection handle: {content.collectionHandle}
        </div>
      ) : null}
      <PlaceholderGrid
        label="Collection"
        columns={Math.min(content.columns?.desktop || 3, 4)}
      />
    </div>
  );
}
