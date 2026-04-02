import {
  getElementContent,
  PreviewCard,
  type ElementComponentProps,
} from "./shared";

export function TabsElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const tabs = Array.isArray(content.tabs) ? content.tabs : [];
  const firstTab = tabs[0];

  return (
    <div>
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}
      >
        {tabs.map((tab: any, index: number) => (
          <div
            key={tab.id || index}
            style={{
              padding: "8px 12px",
              borderBottom: `2px solid ${index === 0 ? content.activeColor || "#111111" : "transparent"}`,
              color:
                index === 0
                  ? content.activeColor || "#111111"
                  : content.inactiveColor || "#888888",
              fontWeight: 600,
            }}
          >
            {tab.label || `Tab ${index + 1}`}
          </div>
        ))}
      </div>
      <PreviewCard>
        <div
          dangerouslySetInnerHTML={{
            __html: firstTab?.content || "<p>Tab content</p>",
          }}
        />
      </PreviewCard>
    </div>
  );
}
