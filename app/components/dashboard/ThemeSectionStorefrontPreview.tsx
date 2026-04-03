function getAccentFromHandle(handle: string) {
  const palette = [
    ["#eff6ff", "#2563eb"],
    ["#ecfdf5", "#059669"],
    ["#fff7ed", "#ea580c"],
    ["#faf5ff", "#9333ea"],
    ["#f0fdfa", "#0f766e"],
  ];
  const index =
    Array.from(handle).reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    palette.length;
  return palette[index];
}

export function ThemeSectionStorefrontPreview({
  handle,
  fileName,
  title,
}: {
  handle: string;
  fileName: string;
  title: string;
}) {
  const [background, accent] = getAccentFromHandle(handle);

  return (
    <div
      aria-label={title}
      style={{
        position: "relative",
        height: 220,
        borderRadius: 18,
        border: "1px solid #dbe2ea",
        background,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(255,255,255,0.75), transparent 36%)",
        }}
      />

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 999,
            background: "#ffffff",
            width: "fit-content",
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: accent,
            }}
          />
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
            Developer preview
          </div>
        </div>

        <div
          style={{
            borderRadius: 16,
            background: "#ffffff",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            padding: 14,
            boxShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 10,
            }}
          >
            {fileName}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <div
              style={{
                height: 72,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${accent} 0%, rgba(255,255,255,0.96) 100%)`,
              }}
            />
            <div
              style={{
                width: "72%",
                height: 10,
                borderRadius: 999,
                background: "#cbd5e1",
              }}
            />
            <div
              style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                background: "#e2e8f0",
              }}
            />
            <div
              style={{
                width: "84%",
                height: 10,
                borderRadius: 999,
                background: "#e2e8f0",
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
          Native theme file previews can&apos;t be rendered live here unless the
          app has Shopify&apos;s protected theme file access.
        </div>
      </div>
    </div>
  );
}
