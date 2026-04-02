import { Select, TextField } from "@shopify/polaris";

export function LinkPicker({
  label = "Link",
  url,
  target,
  onUrlChange,
  onTargetChange,
}: {
  label?: string;
  url: string;
  target: string;
  onUrlChange: (value: string) => void;
  onTargetChange: (value: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <TextField
        label={`${label} URL`}
        autoComplete="off"
        value={url}
        onChange={onUrlChange}
      />
      <Select
        label={`${label} target`}
        options={[
          { label: "Same tab", value: "_self" },
          { label: "New tab", value: "_blank" },
        ]}
        value={target || "_self"}
        onChange={onTargetChange}
      />
    </div>
  );
}
