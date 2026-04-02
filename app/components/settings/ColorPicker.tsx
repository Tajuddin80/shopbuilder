import { TextField } from "@shopify/polaris";

export function ColorPicker({
  label,
  value,
  onChange,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <TextField
        label={label}
        autoComplete="off"
        value={value}
        onChange={onChange}
        helpText={helpText}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            border: "1px solid #dbe2ea",
            background: value || "#ffffff",
          }}
        />
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {value || "transparent"}
        </div>
      </div>
    </div>
  );
}
