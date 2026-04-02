import { Button, ButtonGroup } from "@shopify/polaris";
import { useBuilderStore } from "~/store/builderStore";

const BREAKPOINTS = [
  { label: "Desktop", value: "desktop" },
  { label: "Tablet", value: "tablet" },
  { label: "Mobile", value: "mobile" },
] as const;

export function BreakpointToggle() {
  const { activeBreakpoint, setBreakpoint } = useBuilderStore();

  return (
    <ButtonGroup>
      {BREAKPOINTS.map((breakpoint) => (
        <Button
          key={breakpoint.value}
          pressed={activeBreakpoint === breakpoint.value}
          onClick={() => setBreakpoint(breakpoint.value)}
        >
          {breakpoint.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
