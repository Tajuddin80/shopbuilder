import {
  getElementContent,
  getVimeoEmbedUrl,
  getYoutubeEmbedUrl,
  type ElementComponentProps,
} from "./shared";

export function VideoElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const embedUrl =
    getYoutubeEmbedUrl(content.url || "") ||
    getVimeoEmbedUrl(content.url || "");
  const paddingTop =
    content.aspectRatio === "1:1"
      ? "100%"
      : content.aspectRatio === "4:3"
        ? "75%"
        : content.aspectRatio === "21:9"
          ? "42.85%"
          : "56.25%";

  if (!embedUrl) {
    return (
      <div
        style={{
          borderRadius: 14,
          padding: 20,
          background: "#0f172a",
          color: "#e2e8f0",
          textAlign: "center",
        }}
      >
        Add a YouTube or Vimeo URL to preview the video block.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", paddingTop }}>
      <iframe
        src={embedUrl}
        title="Video preview"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          border: 0,
          borderRadius: 12,
        }}
      />
    </div>
  );
}
