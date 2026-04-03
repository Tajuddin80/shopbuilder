import { Card, Text, TextField } from "@shopify/polaris";
import { useMemo, useState } from "react";
import { ELEMENT_CATEGORIES, ELEMENT_REGISTRY } from "~/lib/elementRegistry";

export function ElementPicker({
  onSelect,
}: {
  onSelect: (entry: (typeof ELEMENT_REGISTRY)[number]) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    if (!normalizedQuery) return ELEMENT_REGISTRY;

    return ELEMENT_REGISTRY.filter((entry) =>
      `${entry.label} ${entry.type} ${entry.category} ${(entry.keywords || []).join(" ")}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <TextField
        label="Search blocks"
        labelHidden
        autoComplete="off"
        placeholder="Search blocks like text, image, video"
        value={query}
        onChange={setQuery}
      />

      {ELEMENT_CATEGORIES.map((category) => {
        const entries = filteredEntries.filter(
          (entry) => entry.category === category.key,
        );
        if (entries.length === 0) return null;

        return (
          <Card key={category.key}>
            <Text as="p" fontWeight="semibold">
              {category.label}
            </Text>
            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {entries.map((entry) => (
                <button
                  key={`${entry.type}-${entry.label}`}
                  type="button"
                  onClick={() => onSelect(entry)}
                  style={{
                    border: "1px solid #dbe2ea",
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 13,
                    color: "#202223",
                    background: "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{entry.label}</div>
                  <div style={{ color: "#6d7175", marginTop: 4 }}>
                    {entry.icon}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
