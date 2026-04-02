import type { ReactNode } from "react";

export function PreviewIframe({
  breakpoint,
  children,
}: {
  breakpoint: "desktop" | "tablet" | "mobile";
  children: ReactNode;
}) {
  const viewportLabel =
    breakpoint === "desktop"
      ? "Desktop preview"
      : breakpoint === "tablet"
        ? "Tablet preview"
        : "Mobile preview";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        minHeight: "100%",
        borderRadius: 24,
        overflow: "hidden",
        background: "#ffffff",
        boxShadow: "0 0 0 1px #e2e8f0, 0 18px 48px rgba(15, 23, 42, 0.10)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px",
          borderBottom: "1px solid #eef2f7",
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background:
                  dot === 0 ? "#fda4af" : dot === 1 ? "#fde68a" : "#86efac",
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
          {viewportLabel}
        </div>
      </div>
      <div style={{ minHeight: 0, flex: 1 }}>{children}</div>
    </div>
  );
}
