import { Checkbox, Text } from "@shopify/polaris";
import { ColorPicker } from "./ColorPicker";
import { ImagePicker } from "./ImagePicker";

export function BackgroundSettings({
  title = "Background",
  color,
  imageUrl,
  fullWidth,
  onColorChange,
  onImageUrlChange,
  onFullWidthChange,
}: {
  title?: string;
  color: string;
  imageUrl?: string | null;
  fullWidth?: boolean;
  onColorChange: (value: string) => void;
  onImageUrlChange?: (value: string) => void;
  onFullWidthChange?: (value: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text as="p" fontWeight="semibold">
        {title}
      </Text>
      {typeof fullWidth === "boolean" && onFullWidthChange ? (
        <Checkbox
          label="Full width"
          checked={fullWidth}
          onChange={onFullWidthChange}
        />
      ) : null}
      <ColorPicker
        label="Background color"
        value={color}
        onChange={onColorChange}
      />
      {onImageUrlChange ? (
        <ImagePicker
          label="Background image URL"
          value={imageUrl || ""}
          onChange={onImageUrlChange}
        />
      ) : null}
    </div>
  );
}
