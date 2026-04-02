import {
  createDefaultColumn,
  createDefaultElement,
  createDefaultSection,
  defaultElementSettings,
  defaultSectionSettings,
  responsiveValue,
} from "./builderDefaults";
import type { Element, Section } from "./pageSchema";

export interface SectionPreset {
  id: string;
  name: string;
  description: string;
  accent: string;
  preview: {
    background: string;
    eyebrow: string;
    headline: string;
    supportingText: string;
  };
  create: () => Section;
}

function makeHeading(
  text: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "heading",
    name: "Heading",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(18),
      ...overrides,
    },
    content: {
      text,
      tag: "h2",
      fontSize: { desktop: 56, tablet: 42, mobile: 32 },
      color: "#0f172a",
      fontWeight: "700",
      fontFamily: "inherit",
      lineHeight: 1.05,
      letterSpacing: -1,
      textTransform: "none",
      linkUrl: "",
      linkTarget: "_self",
      ...contentOverrides,
    },
  });
}

function makeText(
  html: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "text",
    name: "Text",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(20),
      ...overrides,
    },
    content: {
      html,
      fontSize: { desktop: 18, tablet: 17, mobile: 16 },
      color: "#475569",
      fontFamily: "inherit",
      lineHeight: 1.7,
      ...contentOverrides,
    },
  });
}

function makeButton(
  text: string,
  url: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "button",
    name: "Button",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      width: responsiveValue("auto"),
      display: responsiveValue("block"),
      ...overrides,
    },
    content: {
      text,
      url,
      target: "_self",
      style: "filled",
      size: "large",
      backgroundColor: "#111827",
      textColor: "#ffffff",
      borderColor: "#111827",
      hoverBackgroundColor: "#1f2937",
      hoverTextColor: "#ffffff",
      icon: null,
      iconPosition: "left",
      ...contentOverrides,
    },
  });
}

function makeImage(
  src: string,
  alt: string,
  overrides: Partial<Element["settings"]> = {},
) {
  return createDefaultElement({
    type: "image",
    name: "Image",
    settings: {
      ...defaultElementSettings(),
      borderRadius: 28,
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      src,
      alt,
      linkUrl: "",
      linkTarget: "_self",
      objectFit: "cover",
      loading: "lazy",
    },
  });
}

export const SECTION_PRESETS: SectionPreset[] = [
  {
    id: "hero-spotlight",
    name: "Hero Spotlight",
    description:
      "A premium split hero with strong headline, CTA, and lifestyle image.",
    accent: "#1d4ed8",
    preview: {
      background:
        "linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #38bdf8 100%)",
      eyebrow: "Campaign hero",
      headline: "Lead with a bold message",
      supportingText: "High-converting intro section",
    },
    create: () =>
      createDefaultSection({
        name: "Hero Spotlight",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#0f172a"),
          paddingTop: responsiveValue(88),
          paddingBottom: responsiveValue(88),
          paddingLeft: responsiveValue(32),
          paddingRight: responsiveValue(32),
          customClass: "pb-hero-spotlight",
          customCss:
            "background: radial-gradient(circle at top left, rgba(56,189,248,0.42), transparent 26%), linear-gradient(135deg, #020617 0%, #0f172a 36%, #1d4ed8 100%);",
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 55, tablet: 100, mobile: 100 },
            elements: [
              makeText(
                "<p style='letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#bfdbfe;'>New season launch</p>",
                {
                  marginBottom: responsiveValue(12),
                },
              ),
              makeHeading(
                "Build a storefront that feels sharp, fast, and worth buying from.",
                { marginBottom: responsiveValue(18) },
                {
                  color: "#ffffff",
                  fontSize: { desktop: 62, tablet: 46, mobile: 34 },
                },
              ),
              makeText(
                "<p>Combine polished visuals, focused messaging, and modular sections so every campaign page feels intentional instead of assembled.</p>",
                {},
                {
                  color: "#dbeafe",
                  fontSize: { desktop: 18, tablet: 17, mobile: 16 },
                },
              ),
              makeButton("Shop the launch", "/collections/all", {
                customCss: "display:inline-block; margin-right:14px;",
              }),
              makeButton(
                "View the story",
                "/pages/about",
                {
                  customCss: "display:inline-block;",
                },
                {
                  backgroundColor: "transparent",
                  textColor: "#ffffff",
                  borderColor: "#93c5fd",
                },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 45, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/900x900/0f172a/ffffff?text=Feature+Visual",
                "Feature visual",
                {
                  paddingTop: responsiveValue(0),
                  borderRadius: 32,
                  customCss:
                    "box-shadow: 0 24px 80px rgba(15, 23, 42, 0.32); overflow: hidden;",
                } as any,
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "value-grid",
    name: "Value Grid",
    description:
      "Three-card feature grid for highlights, services, or differentiators.",
    accent: "#f97316",
    preview: {
      background:
        "linear-gradient(135deg, #fff7ed 0%, #ffffff 62%, #ffedd5 100%)",
      eyebrow: "Feature row",
      headline: "Show why shoppers should choose you",
      supportingText: "Clean benefit cards with warm contrast",
    },
    create: () =>
      createDefaultSection({
        name: "Value Grid",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#fffaf5"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeHeading(
                "Fast fulfillment",
                {
                  paddingTop: responsiveValue(28),
                  paddingLeft: responsiveValue(28),
                  paddingRight: responsiveValue(28),
                },
                {
                  tag: "h3",
                  fontSize: { desktop: 28, tablet: 26, mobile: 24 },
                  color: "#111827",
                },
              ),
              makeText(
                "<p>Move from order to delivery quickly with a section that highlights speed, reliability, and post-purchase confidence.</p>",
                {
                  paddingLeft: responsiveValue(28),
                  paddingRight: responsiveValue(28),
                  paddingBottom: responsiveValue(28),
                  backgroundColor: "#ffffff",
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "#fdba74",
                },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeHeading(
                "Thoughtful quality",
                {
                  paddingTop: responsiveValue(28),
                  paddingLeft: responsiveValue(28),
                  paddingRight: responsiveValue(28),
                },
                {
                  tag: "h3",
                  fontSize: { desktop: 28, tablet: 26, mobile: 24 },
                  color: "#111827",
                },
              ),
              makeText(
                "<p>Use this card to underline craftsmanship, product standards, or premium ingredients in a way that feels specific and premium.</p>",
                {
                  paddingLeft: responsiveValue(28),
                  paddingRight: responsiveValue(28),
                  paddingBottom: responsiveValue(28),
                  backgroundColor: "#ffffff",
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "#fdba74",
                },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeHeading(
                "Support that stays close",
                {
                  paddingTop: responsiveValue(28),
                  paddingLeft: responsiveValue(28),
                  paddingRight: responsiveValue(28),
                },
                {
                  tag: "h3",
                  fontSize: { desktop: 28, tablet: 26, mobile: 24 },
                  color: "#111827",
                },
              ),
              makeText(
                "<p>Great for guarantees, care instructions, concierge support, or a brand promise that earns trust before checkout.</p>",
                {
                  paddingLeft: responsiveValue(28),
                  paddingRight: responsiveValue(28),
                  paddingBottom: responsiveValue(28),
                  backgroundColor: "#ffffff",
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: "#fdba74",
                },
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "cta-banner",
    name: "CTA Banner",
    description:
      "A centered conversion section for offers, launches, or newsletter pushes.",
    accent: "#0f766e",
    preview: {
      background:
        "linear-gradient(135deg, #0f766e 0%, #14b8a6 45%, #ccfbf1 100%)",
      eyebrow: "Offer banner",
      headline: "Close the page with momentum",
      supportingText: "Focused CTA block with crisp hierarchy",
    },
    create: () =>
      createDefaultSection({
        name: "CTA Banner",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#0f766e"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
          customCss:
            "background: linear-gradient(135deg, #042f2e 0%, #0f766e 48%, #14b8a6 100%);",
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeText(
                "<p style='letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#99f6e4;text-align:center;'>Limited release</p>",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(10),
                },
              ),
              makeHeading(
                "Turn one great section into the action shoppers remember.",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(16),
                },
                {
                  color: "#f0fdfa",
                  fontSize: { desktop: 48, tablet: 38, mobile: 30 },
                },
              ),
              makeText(
                "<p style='text-align:center;'>Use this area for seasonal drops, waitlists, email capture, or a clean final push before the customer leaves the page.</p>",
                { textAlign: responsiveValue("center") },
                { color: "#ccfbf1" },
              ),
              makeButton(
                "Claim the offer",
                "/collections/all",
                {
                  textAlign: responsiveValue("center"),
                  customCss: "display:inline-block;",
                },
                {
                  backgroundColor: "#f8fafc",
                  textColor: "#042f2e",
                  borderColor: "#f8fafc",
                },
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "liquid-slot",
    name: "Custom Liquid Slot",
    description:
      "Use your own Shopify section file or paste custom Liquid directly.",
    accent: "#7c3aed",
    preview: {
      background:
        "linear-gradient(135deg, #111827 0%, #312e81 52%, #7c3aed 100%)",
      eyebrow: "Advanced",
      headline: "Drop in your own section file",
      supportingText: "Ideal for existing Liquid sections",
    },
    create: () =>
      createDefaultSection({
        name: "Custom Liquid Slot",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#0f172a"),
          paddingTop: responsiveValue(32),
          paddingBottom: responsiveValue(32),
          customCss:
            "background: linear-gradient(135deg, #111827 0%, #312e81 48%, #7c3aed 100%);",
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "Use any theme section you already have.",
                { marginBottom: responsiveValue(12) },
                {
                  color: "#ffffff",
                  fontSize: { desktop: 34, tablet: 30, mobile: 24 },
                },
              ),
              makeText(
                "<p>Paste a Shopify section reference below, for example <code>{% section 'custom-hero' %}</code>. Then publish the page and Shopify will render that theme section inside this slot.</p>",
                {},
                { color: "#ddd6fe" },
              ),
              createDefaultElement({
                type: "liquid",
                name: "Liquid",
                settings: {
                  ...defaultElementSettings(),
                  backgroundColor: "rgba(15, 23, 42, 0.45)",
                  borderWidth: 1,
                  borderColor: "rgba(221, 214, 254, 0.35)",
                  borderRadius: 18,
                  paddingTop: responsiveValue(18),
                  paddingBottom: responsiveValue(18),
                  paddingLeft: responsiveValue(18),
                  paddingRight: responsiveValue(18),
                  marginBottom: responsiveValue(0),
                },
                content: {
                  liquid: "{% section 'custom-hero' %}",
                },
              }),
            ],
          }),
        ],
      }),
  },
];

export function createSectionFromPreset(presetId: string) {
  return (
    SECTION_PRESETS.find((preset) => preset.id === presetId)?.create() ?? null
  );
}
