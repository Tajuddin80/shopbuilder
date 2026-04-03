import { Button, InlineStack, TextField } from "@shopify/polaris";

function getColorInputValue(value: string) {
  const trimmed = value.trim();
  return /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.test(trimmed) ? trimmed : "#111111";
}

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
        placeholder="#111111 or transparent"
        helpText={helpText}
      />
      <InlineStack gap="200" blockAlign="center" wrap>
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={getColorInputValue(value)}
          onChange={(event) => onChange(event.currentTarget.value)}
          style={{
            width: 44,
            height: 32,
            padding: 0,
            borderRadius: 8,
            border: "1px solid #dbe2ea",
            background: "#ffffff",
            cursor: "pointer",
          }}
        />
        <Button size="slim" onClick={() => onChange("transparent")}>
          Transparent
        </Button>
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
      </InlineStack>
    </div>
  );
}
