export function ResizeHandle({
  title = "Drag block",
  active = false,
}: {
  title?: string;
  active?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 999,
        border: `1px solid ${active ? "#93c5fd" : "#dbe2ea"}`,
        background: active ? "#eff6ff" : "#ffffff",
        color: "#475569",
        fontSize: 13,
        letterSpacing: 1,
        userSelect: "none",
      }}
    >
      ::
    </div>
  );
}
