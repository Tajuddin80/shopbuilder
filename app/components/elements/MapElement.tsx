import {
  getElementContent,
  getMapEmbedUrl,
  responsiveValue,
  type ElementComponentProps,
} from "./shared";

export function MapElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const embedUrl = getMapEmbedUrl(
    content.query || content.address || content.location || "New York, NY",
  );
  const height = responsiveValue(content.height, 420);

  if (!embedUrl) {
    return (
      <div
        style={{
          padding: 18,
          borderRadius: 12,
          background: "#f8fafc",
          color: "#64748b",
          textAlign: "center",
        }}
      >
        Add a map address or search query.
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      title="Map preview"
      style={{
        width: "100%",
        height,
        border: 0,
        borderRadius: 12,
      }}
    />
  );
}
