import {
  getElementContent,
  PreviewCard,
  type ElementComponentProps,
} from "./shared";

export function ProductCardElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const ratio =
    content.imageRatio === "portrait"
      ? "4 / 5"
      : content.imageRatio === "landscape"
        ? "4 / 3"
        : "1 / 1";

  return (
    <PreviewCard padding={0}>
      <div style={{ aspectRatio: ratio, background: "#f1f5f9" }} />
      <div style={{ padding: 12 }}>
        {content.showVendor ? (
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase" }}>
            Vendor
          </div>
        ) : null}
        {content.showTitle === false ? null : (
          <div style={{ fontWeight: 600, color: "#0f172a" }}>
            {content.productHandle
              ? `Product: ${content.productHandle}`
              : "Product card preview"}
          </div>
        )}
        {content.showPrice === false ? null : (
          <div style={{ marginTop: 4, fontSize: 12, color: "#334155" }}>
            $99.00
          </div>
        )}
        {content.showAddToCart === false ? null : (
          <div
            style={{
              marginTop: 10,
              display: "inline-flex",
              padding: "8px 12px",
              borderRadius: 8,
              background: "#0f172a",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Add to cart
          </div>
        )}
      </div>
    </PreviewCard>
  );
}
