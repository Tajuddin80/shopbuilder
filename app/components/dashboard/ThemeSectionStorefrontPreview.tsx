import { useState } from "react";

export function ThemeSectionStorefrontPreview({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        height: 220,
        borderRadius: 18,
        border: "1px solid #dbe2ea",
        background:
          "linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.96) 100%)",
        overflow: "hidden",
      }}
    >
      {!loaded ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            color: "#64748b",
            fontSize: 13,
            lineHeight: 1.6,
            textAlign: "center",
            background:
              "radial-gradient(circle at top left, rgba(148,163,184,0.18), transparent 36%), linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(241,245,249,0.96) 100%)",
          }}
        >
          Loading live storefront preview...
        </div>
      ) : null}

      <iframe
        title={title}
        src={src}
        loading="lazy"
        sandbox="allow-same-origin allow-scripts"
        onLoad={() => setLoaded(true)}
        style={{
          width: "100%",
          height: "100%",
          border: 0,
          display: "block",
          background: "#ffffff",
        }}
      />
    </div>
  );
}
