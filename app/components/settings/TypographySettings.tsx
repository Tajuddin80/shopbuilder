import { Select, Text, TextField } from "@shopify/polaris";
import { ColorPicker } from "./ColorPicker";

export function TypographySettings({
  title = "Typography",
  tag,
  size,
  color,
  align,
  onTagChange,
  onSizeChange,
  onColorChange,
  onAlignChange,
}: {
  title?: string;
  tag?: string;
  size: number | string;
  color: string;
  align?: string;
  onTagChange?: (value: string) => void;
  onSizeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onAlignChange?: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text as="p" fontWeight="semibold">
        {title}
      </Text>
      {onTagChange ? (
        <Select
          label="Tag"
          options={[
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
            { label: "H4", value: "h4" },
            { label: "Paragraph", value: "p" },
          ]}
          value={tag || "h2"}
          onChange={onTagChange}
        />
      ) : null}
      <TextField
        label="Font size"
        type="number"
        autoComplete="off"
        value={String(size)}
        onChange={onSizeChange}
      />
      {onAlignChange ? (
        <Select
          label="Text align"
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
          value={align || "left"}
          onChange={onAlignChange}
        />
      ) : null}
      <ColorPicker label="Text color" value={color} onChange={onColorChange} />
    </div>
  );
}
