export function ResponsiveToggle({
  value,
  onChange,
}: {
  value: "desktop" | "tablet" | "mobile";
  onChange: (value: "desktop" | "tablet" | "mobile") => void;
}) {
  const options = [
    { label: "Desktop", value: "desktop" },
    { label: "Tablet", value: "tablet" },
    { label: "Mobile", value: "mobile" },
  ] as const;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            border: `1px solid ${value === option.value ? "#93c5fd" : "#dbe2ea"}`,
            background: value === option.value ? "#eff6ff" : "#ffffff",
            color: "#0f172a",
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
