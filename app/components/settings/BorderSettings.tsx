import { Select, Text, TextField } from "@shopify/polaris";
import { ColorPicker } from "./ColorPicker";

export function BorderSettings({
  radius,
  width,
  color,
  style,
  onRadiusChange,
  onWidthChange,
  onColorChange,
  onStyleChange,
}: {
  radius: number;
  width?: number;
  color?: string;
  style?: string;
  onRadiusChange: (value: string) => void;
  onWidthChange?: (value: string) => void;
  onColorChange?: (value: string) => void;
  onStyleChange?: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text as="p" fontWeight="semibold">
        Border
      </Text>
      <TextField
        label="Border radius"
        type="number"
        autoComplete="off"
        value={String(radius)}
        onChange={onRadiusChange}
      />
      {onWidthChange ? (
        <TextField
          label="Border width"
          type="number"
          autoComplete="off"
          value={String(width || 0)}
          onChange={onWidthChange}
        />
      ) : null}
      {onStyleChange ? (
        <Select
          label="Border style"
          options={[
            { label: "Solid", value: "solid" },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
            { label: "Double", value: "double" },
          ]}
          value={style || "solid"}
          onChange={onStyleChange}
        />
      ) : null}
      {onColorChange ? (
        <ColorPicker
          label="Border color"
          value={color || "#e5e7eb"}
          onChange={onColorChange}
        />
      ) : null}
    </div>
  );
}
