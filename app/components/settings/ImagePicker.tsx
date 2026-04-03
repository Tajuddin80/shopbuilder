import { Button, InlineStack, TextField } from "@shopify/polaris";
import { useRef, useState, type ChangeEvent } from "react";

export function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadError(null);
      onChange(String(reader.result || ""));
    };
    reader.onerror = () => {
      setUploadError("The image could not be read.");
    };
    reader.readAsDataURL(file);
    event.currentTarget.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <TextField
        label={label}
        autoComplete="off"
        value={value}
        onChange={(nextValue) => {
          setUploadError(null);
          onChange(nextValue);
        }}
        placeholder="https://..."
        helpText={
          uploadError ||
          "Paste an image URL or upload a file for quick editing."
        }
      />
      <InlineStack gap="200" wrap>
        <Button size="slim" onClick={() => inputRef.current?.click()}>
          Upload image
        </Button>
        {value ? (
          <Button size="slim" onClick={() => onChange("")}>
            Clear image
          </Button>
        ) : null}
      </InlineStack>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <div
        style={{
          border: "1px solid #dbe2ea",
          borderRadius: 12,
          overflow: "hidden",
          background: "#f8fafc",
        }}
      >
        {value ? (
          <img
            src={value}
            alt=""
            style={{
              width: "100%",
              display: "block",
              maxHeight: 180,
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{ padding: 16, fontSize: 13, color: "#64748b" }}>
            Add an image URL to preview it here.
          </div>
        )}
      </div>
    </div>
  );
}
