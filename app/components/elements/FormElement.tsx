import { getElementContent, type ElementComponentProps } from "./shared";

export function FormElement({ element }: ElementComponentProps) {
  const content = getElementContent(element);
  const fields = Array.isArray(content.fields) ? content.fields : [];

  return (
    <form style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {fields.map((field: any) => (
        <div
          key={field.id}
          style={{ display: "flex", flexDirection: "column", gap: 4 }}
        >
          <label style={{ fontSize: 12, color: "#334155" }}>
            {field.label || "Field"}
          </label>
          {field.type === "textarea" ? (
            <textarea
              disabled
              placeholder={field.placeholder}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                minHeight: 120,
                border: `1px solid ${content.inputBorderColor || "#d1d5db"}`,
              }}
            />
          ) : (
            <input
              disabled
              placeholder={field.placeholder}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${content.inputBorderColor || "#d1d5db"}`,
              }}
            />
          )}
        </div>
      ))}
      <button
        type="button"
        style={{
          marginTop: 4,
          padding: "12px 16px",
          border: 0,
          borderRadius: 10,
          background: content.buttonColor || "#111111",
          color: content.buttonTextColor || "#ffffff",
          fontWeight: 600,
        }}
      >
        {content.submitText || "Submit"}
      </button>
    </form>
  );
}
