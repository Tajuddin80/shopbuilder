import { TextField } from "@shopify/polaris";

export function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <TextField
        label={label}
        autoComplete="off"
        value={value}
        onChange={onChange}
        placeholder="https://..."
      />
      <div
        style={{
          border: "1px solid #dbe2ea",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f8fafc",
        }}
      >
        {value ? (
          <img
            src={value}
            alt=""
            style={{
              width: "100%",
              display: "block",
              maxHeight: 180,
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{ padding: 16, fontSize: 13, color: "#64748b" }}>
            Add an image URL to preview it here.
          </div>
        )}
      </div>
    </div>
  );
}
