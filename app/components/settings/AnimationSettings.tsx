import { Checkbox, Select, Text, TextField } from "@shopify/polaris";
import type { AnimationSettings as AnimationSettingsValue } from "~/lib/pageSchema";

export function AnimationSettings({
  value,
  onChange,
}: {
  value: AnimationSettingsValue;
  onChange: (value: Partial<AnimationSettingsValue>) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text as="p" fontWeight="semibold">
        Animation
      </Text>
      <Select
        label="Animation type"
        options={[
          { label: "None", value: "none" },
          { label: "Fade In", value: "fadeIn" },
          { label: "Fade In Up", value: "fadeInUp" },
          { label: "Fade In Down", value: "fadeInDown" },
          { label: "Slide Left", value: "slideInLeft" },
          { label: "Slide Right", value: "slideInRight" },
          { label: "Zoom In", value: "zoomIn" },
        ]}
        value={value.type}
        onChange={(type) =>
          onChange({ type: type as AnimationSettingsValue["type"] })
        }
      />
      <TextField
        label="Duration (ms)"
        type="number"
        autoComplete="off"
        value={String(value.duration)}
        onChange={(duration) => onChange({ duration: Number(duration) || 0 })}
      />
      <TextField
        label="Delay (ms)"
        type="number"
        autoComplete="off"
        value={String(value.delay)}
        onChange={(delay) => onChange({ delay: Number(delay) || 0 })}
      />
      <Checkbox
        label="Animate once"
        checked={value.once}
        onChange={(once) => onChange({ once })}
      />
    </div>
  );
}
