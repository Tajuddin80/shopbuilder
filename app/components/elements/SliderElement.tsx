import {
  getElementContent,
  responsiveValue,
  type ElementComponentProps,
} from "./shared";

export function SliderElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const slides =
    Array.isArray(content.slides) && content.slides.length > 0
      ? content.slides
      : [{ heading: "Slide one", text: "Add slides to preview the slider." }];

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        background: "#0f172a",
        color: "#e2e8f0",
      }}
    >
      <div
        style={{
          height: Math.min(responsiveValue(content.height, 300), 260),
          padding: 24,
          display: "flex",
          alignItems: "flex-end",
          background:
            slides[0].image || slides[0].imageUrl || slides[0].src
              ? `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.78)), url(${slides[0].image || slides[0].imageUrl || slides[0].src}) center/cover no-repeat`
              : "linear-gradient(135deg, #0f172a 0%, #2563eb 100%)",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.1 }}>
            {slides[0].heading || slides[0].title || "Slider preview"}
          </div>
          <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>
            {slides[0].text ||
              slides[0].subtitle ||
              "Add slides and hero images in the settings panel."}
          </div>
        </div>
      </div>
      {content.showDots === false ? null : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            padding: 12,
          }}
        >
          {slides.slice(0, 5).map((_: unknown, index: number) => (
            <div
              key={index}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: index === 0 ? "#ffffff" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
