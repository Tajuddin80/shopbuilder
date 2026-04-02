import type { ReactNode } from "react";
import { useBuilderStore } from "~/store/builderStore";

export interface ElementComponentProps {
  element: any;
  previewId?: string;
}

export function getElementContent(element: any) {
  return element?.content || {};
}

export function getElementSettings(element: any) {
  return element?.settings || {};
}

export function responsiveValue<T>(
  value: T | { desktop?: T } | undefined,
  fallback: T,
) {
  const breakpoint = useBuilderStore.getState().activeBreakpoint;

  if (value && typeof value === "object" && "desktop" in value) {
    return (value[breakpoint as keyof typeof value] ??
      value.desktop ??
      fallback) as T;
  }

  return (value ?? fallback) as T;
}

export function getYoutubeEmbedUrl(url: string) {
  const match =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function getVimeoEmbedUrl(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

export function getMapEmbedUrl(query: string) {
  const value = query.trim();
  if (!value) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(value)}&output=embed`;
}

export function PreviewCard({
  children,
  background = "#ffffff",
  padding = 14,
  border = "1px solid #e2e8f0",
  radius = 14,
}: {
  children: ReactNode;
  background?: string;
  padding?: number;
  border?: string;
  radius?: number;
}) {
  return (
    <div
      style={{
        border,
        borderRadius: radius,
        padding,
        background,
      }}
    >
      {children}
    </div>
  );
}

export function PlaceholderGrid({
  label,
  columns = 3,
}: {
  label: string;
  columns?: number;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 10,
      }}
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          <div style={{ aspectRatio: "1 / 1", background: "#f1f5f9" }} />
          <div style={{ padding: 10, fontSize: 12, color: "#475569" }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function renderIconGlyph(icon: string) {
  switch (icon) {
    case "star":
      return "\u2605";
    case "heart":
      return "\u2665";
    case "check":
      return "\u2713";
    case "plus":
      return "+";
    default:
      return "\u25cf";
  }
}
