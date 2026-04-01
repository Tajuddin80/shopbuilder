import { AppProvider as PolarisProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useEffect } from "react";
import { BuilderToolbar } from "~/components/builder/BuilderToolbar";
import { BuilderSidebar } from "~/components/builder/BuilderSidebar";
import { BuilderCanvas } from "~/components/builder/BuilderCanvas";
import { SettingsPanel } from "~/components/builder/SettingsPanel";
import { useBuilderStore } from "~/store/builderStore";

const SAMPLE_CONTENT = {
  version: "1.0",
  globalStyles: {
    backgroundColor: "#ffffff",
    fontFamily: "sans-serif",
    maxWidth: 1200,
    customCss: "",
  },
  sections: [],
};

export default function DevPreviewRoute() {
  const { setPageContent } = useBuilderStore();

  useEffect(() => {
    setPageContent(SAMPLE_CONTENT as any);
  }, [setPageContent]);

  return (
    <PolarisProvider i18n={enTranslations}>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <BuilderToolbar />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <BuilderSidebar />
          <BuilderCanvas />
          <SettingsPanel />
        </div>
      </div>
    </PolarisProvider>
  );
}

