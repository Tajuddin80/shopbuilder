import {
  cloneSectionWithNewIds,
  createDefaultColumn,
  createDefaultElement,
  createDefaultSection,
  defaultElementSettings,
  defaultSectionSettings,
  responsiveValue,
} from "./builderDefaults";
import type { PageContent, Section } from "./pageSchema";

export interface ThemeSectionLibraryItem {
  handle: string;
  fileName: string;
  name: string;
}

export interface SavedSectionLibraryItem {
  id: string;
  handle: string;
  name: string;
  section: Section;
}

export function slugifySectionHandle(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function humanizeSectionHandle(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function getSavedSectionPageContent(
  section: Section,
  containerWidth = 1200,
): PageContent {
  return {
    version: "1.0",
    globalStyles: {
      backgroundColor: "#ffffff",
      fontFamily: "sans-serif",
      maxWidth: containerWidth,
      customCss: "",
    },
    sections: [section],
  };
}

export function getSavedSectionFromContent(content: any): Section | null {
  if (!content || typeof content !== "object") return null;
  if (!Array.isArray(content.sections) || content.sections.length === 0)
    return null;
  return content.sections[0] as Section;
}

export function createThemeSectionReferenceSection({
  handle,
  name,
}: {
  handle: string;
  name: string;
}) {
  return createDefaultSection({
    name,
    settings: {
      ...defaultSectionSettings(),
      fullWidth: true,
      backgroundColor: responsiveValue("#0f172a"),
      paddingTop: responsiveValue(24),
      paddingBottom: responsiveValue(24),
      paddingLeft: responsiveValue(24),
      paddingRight: responsiveValue(24),
      customCss:
        "background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);",
    },
    columns: [
      createDefaultColumn({
        elements: [
          createDefaultElement({
            type: "heading",
            name: "Heading",
            settings: {
              ...defaultElementSettings(),
              marginBottom: responsiveValue(10),
            },
            content: {
              text: name,
              tag: "h3",
              fontSize: { desktop: 28, tablet: 24, mobile: 22 },
              color: "#ffffff",
              fontWeight: "700",
              fontFamily: "inherit",
              lineHeight: 1.2,
              letterSpacing: 0,
              textTransform: "none",
              linkUrl: "",
              linkTarget: "_self",
            },
          }),
          createDefaultElement({
            type: "text",
            name: "Text",
            settings: {
              ...defaultElementSettings(),
              marginBottom: responsiveValue(12),
            },
            content: {
              text: `Developer reference for the local theme section "${handle}". This only renders in the live theme when Shopify theme-file access is enabled for the app.`,
              fontSize: { desktop: 16, tablet: 16, mobile: 15 },
              color: "#cbd5e1",
              fontFamily: "inherit",
              lineHeight: 1.6,
            },
          }),
          createDefaultElement({
            type: "liquid",
            name: "Liquid",
            settings: {
              ...defaultElementSettings(),
              backgroundColor: "rgba(15, 23, 42, 0.5)",
              borderWidth: 1,
              borderColor: "rgba(148, 163, 184, 0.4)",
              borderRadius: 16,
              paddingTop: responsiveValue(16),
              paddingBottom: responsiveValue(16),
              paddingLeft: responsiveValue(16),
              paddingRight: responsiveValue(16),
              marginBottom: responsiveValue(0),
            },
            content: {
              liquid: `{% section '${handle}' %}`,
            },
          }),
        ],
      }),
    ],
  });
}

export function cloneSavedSection(section: Section) {
  return cloneSectionWithNewIds(section);
}
