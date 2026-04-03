import { CanvasElementPreview } from "~/components/builder/CanvasElementPreview";
import {
  PREVIEW_ANIMATION_STYLES,
  getPreviewAnimationStyle,
} from "~/lib/animationPreview";
import type { ResponsiveValue, Section } from "~/lib/pageSchema";

function getResponsiveValue<T>(
  value: T | ResponsiveValue<T> | undefined,
  fallback: T,
) {
  if (value && typeof value === "object" && "desktop" in value) {
    const responsive = value as ResponsiveValue<T>;
    return (responsive.desktop ?? fallback) as T;
  }

  return (value ?? fallback) as T;
}

function StaticElementPreview({
  element,
  previewKey,
}: {
  element: any;
  previewKey: string;
}) {
  const settings = element?.settings || {};
  const previewId = `${previewKey}-${element.id}`;
  const width = getResponsiveValue(settings.width, "100%");
  const maxWidth = getResponsiveValue(settings.maxWidth, "100%");
  const textAlign = getResponsiveValue(settings.textAlign, "left");
  const display = getResponsiveValue(settings.display, "block");
  const alignment =
    textAlign === "center"
      ? "center"
      : textAlign === "right"
        ? "flex-end"
        : "flex-start";

  if (display === "none") {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: alignment,
        margin: `${getResponsiveValue(settings.marginTop, 0)}px ${getResponsiveValue(settings.marginRight, 0)}px ${getResponsiveValue(settings.marginBottom, 0)}px ${getResponsiveValue(settings.marginLeft, 0)}px`,
      }}
    >
      {settings.customCss ? <style>{`#${previewId}{${settings.customCss}}`}</style> : null}
      <style>{PREVIEW_ANIMATION_STYLES}</style>

      <div
        id={previewId}
        style={{
          ...getPreviewAnimationStyle(settings.animation),
          width,
          maxWidth,
          padding: `${getResponsiveValue(settings.paddingTop, 0)}px ${getResponsiveValue(settings.paddingRight, 0)}px ${getResponsiveValue(settings.paddingBottom, 0)}px ${getResponsiveValue(settings.paddingLeft, 0)}px`,
          border:
            settings.borderWidth > 0
              ? `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}`
              : "1px solid transparent",
          borderRadius: settings.borderRadius ?? 0,
          background: settings.backgroundColor || "transparent",
          opacity: settings.opacity ?? 1,
          overflow: "hidden",
        }}
      >
        <div style={{ textAlign }}>
          <CanvasElementPreview element={element} previewId={previewId} />
        </div>
      </div>
    </div>
  );
}

export function SavedSectionPreview({
  section,
  previewKey,
}: {
  section: Section;
  previewKey: string;
}) {
  const previewId = `saved-section-${previewKey}`;

  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid #dbe2ea",
        background: "#f8fafc",
        overflow: "hidden",
      }}
    >
      <style>{PREVIEW_ANIMATION_STYLES}</style>
      {section.settings.customCss ? (
        <style>{`#${previewId}{${section.settings.customCss}}`}</style>
      ) : null}

      <div
        id={previewId}
        style={{
          ...getPreviewAnimationStyle(section.settings.animation),
          background:
            getResponsiveValue(section.settings.backgroundColor, "#ffffff") || "#ffffff",
          backgroundImage: section.settings.backgroundImage
            ? `url(${section.settings.backgroundImage})`
            : undefined,
          backgroundSize: section.settings.backgroundSize || "cover",
          backgroundPosition: section.settings.backgroundPosition || "center",
        }}
      >
        <div
          style={{
            maxHeight: 280,
            overflow: "auto",
            padding: 12,
          }}
        >
          <div
            style={{
              width: section.settings.fullWidth ? "100%" : "min(100%, 1200px)",
              maxWidth: section.settings.fullWidth ? undefined : 1200,
              margin: "0 auto",
              minHeight:
                getResponsiveValue(section.settings.minHeight, null) ?? undefined,
              padding: `${getResponsiveValue(section.settings.paddingTop, 28)}px ${getResponsiveValue(section.settings.paddingRight, 20)}px ${getResponsiveValue(section.settings.paddingBottom, 28)}px ${getResponsiveValue(section.settings.paddingLeft, 20)}px`,
              borderRadius: section.settings.borderRadius ?? 24,
              border:
                section.settings.borderWidth > 0
                  ? `${section.settings.borderWidth}px ${section.settings.borderStyle} ${section.settings.borderColor}`
                  : "1px solid rgba(148, 163, 184, 0.18)",
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
              background:
                getResponsiveValue(section.settings.backgroundColor, "#ffffff") ||
                "#ffffff",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${Math.min(section.columns.length, 2)}, minmax(0, 1fr))`,
                gap: 14,
                alignItems: "stretch",
              }}
            >
              {section.columns.map((column) => (
                <div
                  key={column.id}
                  style={{
                    flex: `1 1 ${getResponsiveValue(column.width, 100)}%`,
                    minWidth: 0,
                    padding: `${getResponsiveValue(column.settings.paddingTop, 0)}px ${getResponsiveValue(column.settings.paddingRight, 10)}px ${getResponsiveValue(column.settings.paddingBottom, 0)}px ${getResponsiveValue(column.settings.paddingLeft, 10)}px`,
                    background: column.settings.backgroundColor || "transparent",
                    borderRadius: 14,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent:
                      column.settings.verticalAlign === "middle"
                        ? "center"
                        : column.settings.verticalAlign === "bottom"
                          ? "flex-end"
                          : "flex-start",
                    gap: 8,
                  }}
                >
                  {column.elements.map((element: any) => (
                    <StaticElementPreview
                      key={element.id}
                      element={element}
                      previewKey={previewId}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
