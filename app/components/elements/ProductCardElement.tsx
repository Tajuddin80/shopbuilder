import {
  getElementContent,
  PreviewCard,
  type ElementComponentProps,
} from "./shared";

export function ProductCardElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);

  return (
    <PreviewCard padding={0}>
      <div style={{ aspectRatio: "1 / 1", background: "#f1f5f9" }} />
      <div style={{ padding: 12 }}>
        <div style={{ fontWeight: 600, color: "#0f172a" }}>
          {content.productHandle
            ? `Product: ${content.productHandle}`
            : "Product card preview"}
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
          {content.showPrice === false
            ? "Title only layout"
            : "Connect product data in Shopify theme output."}
        </div>
      </div>
    </PreviewCard>
  );
}
