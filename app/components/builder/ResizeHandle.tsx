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
        width: 18,
        height: 18,
        borderRadius: 999,
        color: active ? "#2563eb" : "#475569",
        fontSize: 11,
        letterSpacing: 2,
        userSelect: "none",
      }}
    >
      ...
    </div>
  );
}
