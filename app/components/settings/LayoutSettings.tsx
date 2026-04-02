import { Button, InlineStack, Select, Text, TextField } from "@shopify/polaris";

export function LayoutSettings({
  value,
  options,
  columnWidths,
  onLayoutChange,
  onAddColumn,
  onRemoveColumn,
  onReverse,
  onColumnWidthChange,
}: {
  value: string;
  options: Array<{ label: string; value: string }>;
  columnWidths: number[];
  onLayoutChange: (value: string) => void;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
  onReverse: () => void;
  onColumnWidthChange: (index: number, value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text as="p" fontWeight="semibold">
        Layout
      </Text>
      <Select
        label="Column layout"
        options={options}
        value={value}
        onChange={onLayoutChange}
      />
      <InlineStack gap="200">
        <Button onClick={onAddColumn} disabled={columnWidths.length >= 4}>
          Add Column
        </Button>
        <Button onClick={onRemoveColumn} disabled={columnWidths.length <= 1}>
          Remove Column
        </Button>
      </InlineStack>
      <Button onClick={onReverse} fullWidth>
        Reverse Left / Right
      </Button>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {columnWidths.map((width, index) => (
          <TextField
            key={index}
            label={`Column ${index + 1} width (%)`}
            type="number"
            autoComplete="off"
            value={String(width)}
            onChange={(value) => onColumnWidthChange(index, value)}
          />
        ))}
      </div>
    </div>
  );
}
