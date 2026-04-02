import { Text, TextField } from "@shopify/polaris";

export function SpacingSettings({
  title,
  top,
  bottom,
  left,
  right,
  onTopChange,
  onBottomChange,
  onLeftChange,
  onRightChange,
}: {
  title: string;
  top: number;
  bottom: number;
  left?: number;
  right?: number;
  onTopChange: (value: string) => void;
  onBottomChange: (value: string) => void;
  onLeftChange?: (value: string) => void;
  onRightChange?: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text as="p" fontWeight="semibold">
        {title}
      </Text>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <TextField
          label="Top"
          type="number"
          autoComplete="off"
          value={String(top)}
          onChange={onTopChange}
        />
        <TextField
          label="Bottom"
          type="number"
          autoComplete="off"
          value={String(bottom)}
          onChange={onBottomChange}
        />
        {onLeftChange ? (
          <TextField
            label="Left"
            type="number"
            autoComplete="off"
            value={String(left || 0)}
            onChange={onLeftChange}
          />
        ) : null}
        {onRightChange ? (
          <TextField
            label="Right"
            type="number"
            autoComplete="off"
            value={String(right || 0)}
            onChange={onRightChange}
          />
        ) : null}
      </div>
    </div>
  );
}
