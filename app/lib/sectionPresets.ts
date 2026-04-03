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
  keywords?: string[];
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

function makeSpacer(
  height = 20,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "spacer",
    name: "Spacer",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      height: { desktop: height, tablet: Math.max(12, height - 4), mobile: Math.max(8, height - 8) },
      ...contentOverrides,
    },
  });
}

function makeIcon(
  icon: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "icon",
    name: "Icon",
    settings: {
      ...defaultElementSettings(),
      width: responsiveValue("auto"),
      marginBottom: responsiveValue(12),
      ...overrides,
    },
    content: {
      icon,
      size: { desktop: 30, tablet: 28, mobile: 26 },
      color: "#0f172a",
      linkUrl: "",
      ...contentOverrides,
    },
  });
}

function makeVideo(
  url: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "video",
    name: "Video",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      borderRadius: 24,
      ...overrides,
    },
    content: {
      videoType: "youtube",
      url,
      autoplay: false,
      loop: false,
      muted: false,
      controls: true,
      aspectRatio: "16:9",
      posterImage: "",
      ...contentOverrides,
    },
  });
}

function makeSlider(
  slides: Array<Record<string, unknown>>,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "slider",
    name: "Slider",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      slides,
      autoplay: true,
      autoplaySpeed: 5000,
      showArrows: true,
      showDots: true,
      height: { desktop: 520, tablet: 420, mobile: 320 },
      transition: "slide",
      ...contentOverrides,
    },
  });
}

function makeProductCard(
  productHandle: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "product_card",
    name: "Featured Product",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      productHandle,
      showPrice: true,
      showTitle: true,
      showVendor: false,
      showRating: false,
      showAddToCart: true,
      imageRatio: "square",
      layout: "vertical",
      ...contentOverrides,
    },
  });
}

function makeProductGrid(
  collectionHandle: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "product_grid",
    name: "Product Grid",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      source: "collection",
      collectionId: collectionHandle,
      productIds: [],
      tag: "",
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      limit: 6,
      showPagination: false,
      sortBy: "best-selling",
      ...contentOverrides,
    },
  });
}

function makeCollectionGrid(
  collectionHandle: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "collection",
    name: "Collection",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      collectionHandle,
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      showTitle: true,
      showProductCount: false,
      imageRatio: "square",
      limit: 6,
      ...contentOverrides,
    },
  });
}

function makeTestimonials(
  items: Array<Record<string, unknown>>,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "testimonial",
    name: "Testimonials",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      items,
      layout: "grid",
      columns: { desktop: 3, tablet: 2, mobile: 1 },
      showRating: true,
      showAvatar: false,
      ...contentOverrides,
    },
  });
}

function makeAccordion(
  items: Array<Record<string, unknown>>,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "accordion",
    name: "FAQ",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      items,
      allowMultiple: false,
      defaultOpen: null,
      iconType: "plus",
      borderColor: "#e5e7eb",
      headingColor: "#111111",
      contentColor: "#475569",
      ...contentOverrides,
    },
  });
}

function makeTabs(
  tabs: Array<Record<string, unknown>>,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "tabs",
    name: "Tabs",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      tabs,
      activeColor: "#111111",
      inactiveColor: "#94a3b8",
      tabStyle: "underline",
      alignment: "left",
      ...contentOverrides,
    },
  });
}

function makeForm(
  fields: Array<Record<string, unknown>>,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "form",
    name: "Form",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      fields,
      submitText: "Submit",
      successMessage: "Thank you!",
      emailRecipient: "",
      backgroundColor: "transparent",
      inputBorderColor: "#d1d5db",
      buttonColor: "#111111",
      buttonTextColor: "#ffffff",
      ...contentOverrides,
    },
  });
}

function makeSocialIcons(
  icons: Array<Record<string, unknown>>,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "social_icons",
    name: "Social Icons",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      icons,
      iconSize: 24,
      iconColor: "#111111",
      iconStyle: "logo",
      gap: 12,
      alignment: "left",
      ...contentOverrides,
    },
  });
}

function makeCountdown(
  targetDate: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "countdown",
    name: "Countdown",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      ...overrides,
    },
    content: {
      targetDate,
      timezone: "UTC",
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
      labelStyle: "below",
      numberColor: "#111111",
      labelColor: "#64748b",
      separatorColor: "#e2e8f0",
      expiredText: "Offer ended",
      redirectUrl: "",
      ...contentOverrides,
    },
  });
}

function makeMap(
  query: string,
  overrides: Partial<Element["settings"]> = {},
  contentOverrides: Record<string, unknown> = {},
) {
  return createDefaultElement({
    type: "map",
    name: "Map",
    settings: {
      ...defaultElementSettings(),
      marginBottom: responsiveValue(0),
      borderRadius: 20,
      ...overrides,
    },
    content: {
      query,
      zoom: 12,
      height: { desktop: 420, tablet: 360, mobile: 300 },
      ...contentOverrides,
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
                },
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
    keywords: [
      "theme section",
      "custom liquid",
      "mega menu",
      "search bar",
      "breadcrumbs",
      "wishlist",
      "compare",
    ],
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
  {
    id: "announcement-bar",
    name: "Announcement Bar",
    description:
      "Promo strip with messaging, countdown urgency, and a compact CTA.",
    accent: "#ea580c",
    keywords: ["promo bar", "countdown timer", "announcement", "offer strip"],
    preview: {
      background:
        "linear-gradient(135deg, #7c2d12 0%, #ea580c 55%, #fb923c 100%)",
      eyebrow: "Header utility",
      headline: "Promote a launch, sale, or shipping message",
      supportingText: "Compact top-of-page promo section",
    },
    create: () =>
      createDefaultSection({
        name: "Announcement Bar",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#7c2d12"),
          paddingTop: responsiveValue(18),
          paddingBottom: responsiveValue(18),
          paddingLeft: responsiveValue(24),
          paddingRight: responsiveValue(24),
          customCss:
            "background: linear-gradient(135deg, #7c2d12 0%, #ea580c 55%, #fb923c 100%);",
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 42, tablet: 100, mobile: 100 },
            elements: [
              makeText(
                "<p style='margin:0;color:#ffedd5;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;'>Free shipping over $75</p>",
                { marginBottom: responsiveValue(0) },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 34, tablet: 100, mobile: 100 },
            elements: [
              makeCountdown(
                new Date(Date.now() + 5 * 86400000).toISOString(),
                {},
                {
                  numberColor: "#ffffff",
                  labelColor: "#fed7aa",
                  expiredText: "Offer ended",
                },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 24, tablet: 100, mobile: 100 },
            elements: [
              makeButton(
                "Shop now",
                "/collections/all",
                { textAlign: responsiveValue("right") },
                {
                  backgroundColor: "#fff7ed",
                  textColor: "#9a3412",
                  borderColor: "#fff7ed",
                },
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "slideshow-hero",
    name: "Slideshow Hero",
    description:
      "Full-width hero carousel for campaigns, collections, and editorial launches.",
    accent: "#2563eb",
    keywords: ["hero slider", "slideshow", "carousel", "image banner"],
    preview: {
      background:
        "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #38bdf8 100%)",
      eyebrow: "Hero media",
      headline: "Rotate featured drops and campaign messages",
      supportingText: "Multi-slide hero section",
    },
    create: () =>
      createDefaultSection({
        name: "Slideshow Hero",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          paddingTop: responsiveValue(24),
          paddingBottom: responsiveValue(24),
          paddingLeft: responsiveValue(24),
          paddingRight: responsiveValue(24),
          backgroundColor: responsiveValue("#0f172a"),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeSlider([
                {
                  id: "1",
                  heading: "New season essentials",
                  text: "Highlight launches, restocks, or campaign imagery with a flexible slideshow.",
                  image:
                    "https://placehold.co/1600x900/0f172a/ffffff?text=Slide+One",
                },
                {
                  id: "2",
                  heading: "Show the best sellers",
                  text: "Use multiple slides for seasonal stories, promos, or featured categories.",
                  image:
                    "https://placehold.co/1600x900/1d4ed8/ffffff?text=Slide+Two",
                },
              ]),
            ],
          }),
        ],
      }),
  },
  {
    id: "video-banner",
    name: "Video Banner",
    description:
      "Split hero with brand message, CTA, and a strong video showcase.",
    accent: "#dc2626",
    keywords: ["video hero", "background video", "video banner"],
    preview: {
      background:
        "linear-gradient(135deg, #111827 0%, #7f1d1d 52%, #dc2626 100%)",
      eyebrow: "Motion hero",
      headline: "Pair a campaign message with product motion",
      supportingText: "High-impact video-led banner",
    },
    create: () =>
      createDefaultSection({
        name: "Video Banner",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#111827"),
          paddingTop: responsiveValue(64),
          paddingBottom: responsiveValue(64),
          paddingLeft: responsiveValue(28),
          paddingRight: responsiveValue(28),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 42, tablet: 100, mobile: 100 },
            elements: [
              makeText(
                "<p style='letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#fca5a5;'>Behind the product</p>",
                { marginBottom: responsiveValue(12) },
              ),
              makeHeading(
                "Let the brand story move before the shopper scrolls away.",
                {},
                {
                  color: "#ffffff",
                  fontSize: { desktop: 52, tablet: 40, mobile: 30 },
                },
              ),
              makeText(
                "<p>Use a YouTube or Vimeo clip for a founder message, process story, or launch teaser.</p>",
                {},
                { color: "#fecaca" },
              ),
              makeButton("Watch more", "/pages/about", {}, {
                backgroundColor: "#ffffff",
                textColor: "#111827",
                borderColor: "#ffffff",
              }),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 58, tablet: 100, mobile: 100 },
            elements: [
              makeVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
            ],
          }),
        ],
      }),
  },
  {
    id: "split-banner",
    name: "Split Banner",
    description:
      "Balanced image-with-text layout for collection launches and hero storytelling.",
    accent: "#0f766e",
    keywords: [
      "image with text",
      "split hero",
      "split banner",
      "feature banner",
    ],
    preview: {
      background:
        "linear-gradient(135deg, #ecfeff 0%, #ccfbf1 42%, #99f6e4 100%)",
      eyebrow: "Editorial",
      headline: "Pair photography with a conversion-focused message",
      supportingText: "Side-by-side image and content",
    },
    create: () =>
      createDefaultSection({
        name: "Split Banner",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#f0fdfa"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 50, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/1100x900/e2f8f3/0f172a?text=Editorial+Image",
                "Editorial",
                {
                  borderRadius: 28,
                  customCss:
                    "box-shadow: 0 24px 60px rgba(13, 148, 136, 0.16); overflow:hidden;",
                },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 50, tablet: 100, mobile: 100 },
            elements: [
              makeText(
                "<p style='letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#0f766e;'>New drop</p>",
                { marginBottom: responsiveValue(10) },
              ),
              makeHeading(
                "A clean split layout makes merchandise feel considered.",
              ),
              makeText(
                "<p>Ideal for launch stories, feature callouts, collection intros, or rich editorial messaging.</p>",
              ),
              makeButton("Browse collection", "/collections/all"),
            ],
          }),
        ],
      }),
  },
  {
    id: "featured-product",
    name: "Featured Product",
    description:
      "Showcase one hero product alongside supporting copy and a direct purchase path.",
    accent: "#9333ea",
    keywords: ["single product", "product showcase", "buy now"],
    preview: {
      background:
        "linear-gradient(135deg, #faf5ff 0%, #ede9fe 46%, #ddd6fe 100%)",
      eyebrow: "Commerce focus",
      headline: "Feature one product with narrative and proof",
      supportingText: "Single-product showcase section",
    },
    create: () =>
      createDefaultSection({
        name: "Featured Product",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#faf5ff"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 44, tablet: 100, mobile: 100 },
            elements: [
              makeHeading("Hero product spotlight"),
              makeText(
                "<p>Pair product data with supporting copy, offer context, and a direct route into purchase.</p>",
              ),
              makeButton("View details", "/products/sample-product"),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 56, tablet: 100, mobile: 100 },
            elements: [makeProductCard("sample-product")],
          }),
        ],
      }),
  },
  {
    id: "product-recommendations",
    name: "Product Recommendations",
    description:
      "Merchandise a set of products from a collection in a clean recommendation grid.",
    accent: "#1d4ed8",
    keywords: ["related products", "also bought", "recently viewed", "upsell"],
    preview: {
      background:
        "linear-gradient(135deg, #eff6ff 0%, #dbeafe 45%, #bfdbfe 100%)",
      eyebrow: "Recommendations",
      headline: "Guide shoppers to the next best product",
      supportingText: "Grid-based recommendation section",
    },
    create: () =>
      createDefaultSection({
        name: "Product Recommendations",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#eff6ff"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "You may also like",
                { textAlign: responsiveValue("center") },
                { fontSize: { desktop: 42, tablet: 34, mobile: 28 } },
              ),
              makeText(
                "<p style='text-align:center;'>Use collection-powered merchandising for bundles, cross-sells, or seasonal edits.</p>",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(24),
                },
              ),
              makeProductGrid("frontpage"),
            ],
          }),
        ],
      }),
  },
  {
    id: "collection-spotlight",
    name: "Collection Spotlight",
    description:
      "Highlight collections as curated landing points with strong visual hierarchy.",
    accent: "#0f766e",
    keywords: ["collection list", "featured collection", "collection grid"],
    preview: {
      background:
        "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 42%, #a7f3d0 100%)",
      eyebrow: "Collections",
      headline: "Show shoppers where to explore next",
      supportingText: "Collection showcase and category discovery",
    },
    create: () =>
      createDefaultSection({
        name: "Collection Spotlight",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#ecfdf5"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "Browse by collection",
                { textAlign: responsiveValue("center") },
                { fontSize: { desktop: 42, tablet: 34, mobile: 28 } },
              ),
              makeText(
                "<p style='text-align:center;'>Turn category entry points into a polished merchandising moment.</p>",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(24),
                },
              ),
              makeCollectionGrid("frontpage"),
            ],
          }),
        ],
      }),
  },
  {
    id: "rich-text-cta",
    name: "Rich Text CTA",
    description:
      "Simple heading, copy, and action layout for campaign messaging or brand statements.",
    accent: "#334155",
    keywords: ["rich text", "cta block", "copy section", "content block"],
    preview: {
      background:
        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 46%, #cbd5e1 100%)",
      eyebrow: "Content",
      headline: "Keep the section clean and message-forward",
      supportingText: "Heading, copy, and CTA starter",
    },
    create: () =>
      createDefaultSection({
        name: "Rich Text CTA",
        settings: {
          ...defaultSectionSettings(),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "A flexible rich text section works almost everywhere.",
                { textAlign: responsiveValue("center") },
              ),
              makeText(
                "<p style='text-align:center;'>Use it for editorials, banners, about content, collection intros, or campaign support copy.</p>",
                { textAlign: responsiveValue("center") },
              ),
              makeButton(
                "Read more",
                "/pages/about",
                {
                  textAlign: responsiveValue("center"),
                  customCss: "display:inline-block;",
                },
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "collage-gallery",
    name: "Collage Gallery",
    description:
      "Three-column visual section for lookbooks, gallery moments, or campaign imagery.",
    accent: "#e11d48",
    keywords: ["image gallery", "collage", "image grid", "lookbook"],
    preview: {
      background:
        "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 44%, #fecdd3 100%)",
      eyebrow: "Visual storytelling",
      headline: "Build momentum with a collage of campaign imagery",
      supportingText: "Gallery-style image section",
    },
    create: () =>
      createDefaultSection({
        name: "Collage Gallery",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#fff1f2"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/800x960/fda4af/111827?text=Gallery+One",
                "Gallery one",
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/800x640/fbcfe8/111827?text=Gallery+Two",
                "Gallery two",
              ),
              makeSpacer(20),
              makeImage(
                "https://placehold.co/800x520/ffe4e6/111827?text=Gallery+Three",
                "Gallery three",
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeHeading(
                "Tell the campaign in frames",
                {},
                { fontSize: { desktop: 34, tablet: 30, mobile: 24 } },
              ),
              makeText(
                "<p>Perfect for product drops, seasonal collections, lookbooks, or UGC curation.</p>",
              ),
              makeButton("View all", "/collections/all"),
            ],
          }),
        ],
      }),
  },
  {
    id: "before-after-slider",
    name: "Before & After Slider",
    description:
      "Two-image comparison section with before and after visuals.",
    accent: "#0f172a",
    keywords: ["before after", "comparison slider", "image comparison"],
    preview: {
      background:
        "linear-gradient(135deg, #0f172a 0%, #334155 52%, #64748b 100%)",
      eyebrow: "Product story",
      headline: "Show a clear before and after moment",
      supportingText: "Editable comparison section",
    },
    create: () =>
      createDefaultSection({
        name: "Before & After Slider",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#f8fafc"),
          paddingTop: responsiveValue(56),
          paddingBottom: responsiveValue(56),
        },
        columns: [
          createDefaultColumn({
            width: responsiveValue(50),
            elements: [
              makeText("<p><strong>Before</strong></p>", {
                marginBottom: responsiveValue(12),
              }),
              makeImage("https://placehold.co/900x900/e2e8f0/0f172a?text=Before", "Before image"),
            ],
          }),
          createDefaultColumn({
            width: responsiveValue(50),
            elements: [
              makeText("<p><strong>After</strong></p>", {
                marginBottom: responsiveValue(12),
              }),
              makeImage("https://placehold.co/900x900/cffafe/0f172a?text=After", "After image"),
            ],
          }),
        ],
      }),
  },
  {
    id: "feature-callout-native",
    name: "Feature Callout",
    description:
      "Concise feature or promo callout with heading, copy, and action.",
    accent: "#0f766e",
    keywords: ["feature callout", "promo callout", "announcement"],
    preview: {
      background:
        "linear-gradient(135deg, #0f766e 0%, #14b8a6 48%, #5eead4 100%)",
      eyebrow: "Promotion",
      headline: "Highlight one strong product benefit",
      supportingText: "Editable callout section",
    },
    create: () =>
      createDefaultSection({
        name: "Feature Callout",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#ecfdf5"),
          paddingTop: responsiveValue(56),
          paddingBottom: responsiveValue(56),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeText("<p>New release</p>", {
                marginBottom: responsiveValue(12),
              }, {
                fontSize: { desktop: 14, tablet: 14, mobile: 13 },
                color: "#0f766e",
              }),
              makeHeading("Built to convert more first-time shoppers.", {}, {
                fontSize: { desktop: 44, tablet: 36, mobile: 28 },
              }),
              makeText(
                "<p>Use this section for a feature launch, limited offer, or short product story with one focused CTA.</p>",
              ),
              makeButton("Shop now", "/collections/all", {}, {
                backgroundColor: "#0f172a",
                borderColor: "#0f172a",
              }),
            ],
          }),
        ],
      }),
  },
  {
    id: "testimonials-grid",
    name: "Testimonials Grid",
    description:
      "Customer voice section with quote cards and clean review styling.",
    accent: "#f59e0b",
    keywords: ["reviews", "social proof", "ratings"],
    preview: {
      background:
        "linear-gradient(135deg, #fffbeb 0%, #fef3c7 44%, #fde68a 100%)",
      eyebrow: "Social proof",
      headline: "Let review-style quotes carry the trust",
      supportingText: "Testimonial and review grid",
    },
    create: () =>
      createDefaultSection({
        name: "Testimonials Grid",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#fffbeb"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "Customers are saying the right things.",
                { textAlign: responsiveValue("center") },
              ),
              makeText(
                "<p style='text-align:center;'>Use quote cards, ratings, and social proof to reinforce trust before checkout.</p>",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(24),
                },
              ),
              makeTestimonials([
                {
                  id: "1",
                  quote:
                    "The product quality exceeded expectations and the page felt premium from the first scroll.",
                  author: "Mina K.",
                  role: "Verified buyer",
                  rating: 5,
                },
                {
                  id: "2",
                  quote:
                    "Fast shipping, clear messaging, and a layout that made it easy to buy.",
                  author: "Jared T.",
                  role: "Customer",
                  rating: 5,
                },
                {
                  id: "3",
                  quote:
                    "The storytelling and product grid made this launch feel far more polished.",
                  author: "Priya S.",
                  role: "Subscriber",
                  rating: 5,
                },
              ]),
            ],
          }),
        ],
      }),
  },
  {
    id: "trust-badge-row",
    name: "Trust Badges & Logos",
    description:
      "Compact proof bar for secure checkout badges, social icons, or partner logos.",
    accent: "#334155",
    keywords: [
      "trust badges",
      "secure checkout",
      "press logos",
      "media logos",
    ],
    preview: {
      background:
        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 46%, #cbd5e1 100%)",
      eyebrow: "Trust",
      headline: "Reinforce credibility with badges and logos",
      supportingText: "Social proof strip for logos or icons",
    },
    create: () =>
      createDefaultSection({
        name: "Trust Badges & Logos",
        settings: {
          ...defaultSectionSettings(),
          paddingTop: responsiveValue(48),
          paddingBottom: responsiveValue(48),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeText(
                "<p style='text-align:center;letter-spacing:0.16em;text-transform:uppercase;font-weight:700;color:#64748b;'>Trusted by teams and shoppers</p>",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(16),
                },
              ),
              makeSocialIcons(
                [
                  { platform: "visa", url: "#" },
                  { platform: "mc", url: "#" },
                  { platform: "amex", url: "#" },
                  { platform: "ssl", url: "#" },
                  { platform: "press", url: "#" },
                ],
                {},
                {
                  iconSize: 42,
                  gap: 16,
                  alignment: "center",
                  iconStyle: "filled",
                  iconColor: "#0f172a",
                },
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "newsletter-signup",
    name: "Newsletter Signup",
    description:
      "Email capture section for launch lists, promos, and subscriber offers.",
    accent: "#0f766e",
    keywords: ["email signup", "newsletter", "lead capture", "popup form"],
    preview: {
      background:
        "linear-gradient(135deg, #052e2b 0%, #0f766e 48%, #14b8a6 100%)",
      eyebrow: "Email capture",
      headline: "Give shoppers a reason to stay in the loop",
      supportingText: "Newsletter and signup section",
    },
    create: () =>
      createDefaultSection({
        name: "Newsletter Signup",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#052e2b"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 46, tablet: 100, mobile: 100 },
            elements: [
              makeHeading(
                "Join the launch list",
                {},
                {
                  color: "#ffffff",
                  fontSize: { desktop: 48, tablet: 38, mobile: 30 },
                },
              ),
              makeText(
                "<p>Capture subscribers for restocks, early access, and campaign drops with a focused signup section.</p>",
                {},
                { color: "#ccfbf1" },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 54, tablet: 100, mobile: 100 },
            elements: [
              makeForm(
                [
                  {
                    id: "1",
                    type: "email",
                    label: "Email",
                    placeholder: "you@example.com",
                    required: true,
                    options: [],
                  },
                ],
                {},
                {
                  submitText: "Subscribe",
                  successMessage: "Thanks for subscribing!",
                  inputBorderColor: "#99f6e4",
                  buttonColor: "#ffffff",
                  buttonTextColor: "#042f2e",
                },
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "brand-story",
    name: "Brand Story",
    description:
      "Editorial story section for about content, founder notes, and mission statements.",
    accent: "#9a3412",
    keywords: ["about us", "brand story", "about block", "team story"],
    preview: {
      background:
        "linear-gradient(135deg, #fffbeb 0%, #fef3c7 46%, #fdba74 100%)",
      eyebrow: "Brand narrative",
      headline: "Build trust with a story people can actually feel",
      supportingText: "About and brand storytelling section",
    },
    create: () =>
      createDefaultSection({
        name: "Brand Story",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#fffbeb"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 45, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/900x900/fcd34d/111827?text=Brand+Story",
                "Brand story",
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 55, tablet: 100, mobile: 100 },
            elements: [
              makeText(
                "<p style='letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#b45309;'>Our story</p>",
                { marginBottom: responsiveValue(10) },
              ),
              makeHeading(
                "Tell people what changed, why it matters, and why this brand exists.",
              ),
              makeText(
                "<p>Use this block for founder notes, process stories, team values, sourcing details, or mission-driven brand content.</p>",
              ),
              makeButton("Read the full story", "/pages/about"),
            ],
          }),
        ],
      }),
  },
  {
    id: "feature-list",
    name: "Feature List",
    description:
      "Three-column benefits section for product advantages, services, or brand differentiators.",
    accent: "#0284c7",
    keywords: ["bullet benefits", "feature list", "icons with text"],
    preview: {
      background:
        "linear-gradient(135deg, #f0f9ff 0%, #dbeafe 44%, #bae6fd 100%)",
      eyebrow: "Benefits",
      headline: "Turn benefits into a scannable feature grid",
      supportingText: "Icons, headings, and supporting copy",
    },
    create: () =>
      createDefaultSection({
        name: "Feature List",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#f0f9ff"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [0, 1, 2].map((index) =>
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeIcon(
                index === 0 ? "check" : index === 1 ? "star" : "heart",
                {},
                { color: "#0369a1" },
              ),
              makeHeading(
                index === 0
                  ? "Thoughtful product design"
                  : index === 1
                    ? "Support that stays responsive"
                    : "Presentation that builds trust",
                {},
                {
                  tag: "h3",
                  fontSize: { desktop: 28, tablet: 24, mobile: 22 },
                },
              ),
              makeText(
                "<p>Use this card to explain a product benefit, a service promise, or an operational advantage.</p>",
              ),
            ],
          }),
        ),
      }),
  },
  {
    id: "faq-stack",
    name: "FAQ Stack",
    description:
      "A simple FAQ section with accordion behavior for support and shipping questions.",
    accent: "#0f172a",
    keywords: ["faq", "accordion", "shipping questions", "returns"],
    preview: {
      background:
        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 42%, #cbd5e1 100%)",
      eyebrow: "Support",
      headline: "Keep the questions clear and the answers easy to skim",
      supportingText: "FAQ and accordion section",
    },
    create: () =>
      createDefaultSection({
        name: "FAQ Stack",
        settings: {
          ...defaultSectionSettings(),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "Frequently asked questions",
                { textAlign: responsiveValue("center") },
              ),
              makeText(
                "<p style='text-align:center;'>Answer shipping, returns, sizing, or subscription questions in one clean section.</p>",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(24),
                },
              ),
              makeAccordion([
                {
                  id: "1",
                  question: "How long does shipping take?",
                  answer:
                    "Standard shipping usually arrives within 3-5 business days.",
                },
                {
                  id: "2",
                  question: "Can I return an item?",
                  answer:
                    "Yes. Returns are accepted within 30 days in original condition.",
                },
                {
                  id: "3",
                  question: "Do you restock sold out items?",
                  answer:
                    "Popular products are restocked regularly. Invite customers to join your email list for updates.",
                },
              ]),
            ],
          }),
        ],
      }),
  },
  {
    id: "stats-band",
    name: "Stats Band",
    description:
      "Simple metrics section for subscriber counts, review totals, or team milestones.",
    accent: "#0891b2",
    keywords: ["stats", "numbers", "10k customers", "metrics"],
    preview: {
      background:
        "linear-gradient(135deg, #cffafe 0%, #a5f3fc 42%, #67e8f9 100%)",
      eyebrow: "Numbers",
      headline: "Let the numbers validate the story",
      supportingText: "Stats and milestone section",
    },
    create: () =>
      createDefaultSection({
        name: "Stats Band",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#cffafe"),
          paddingTop: responsiveValue(48),
          paddingBottom: responsiveValue(48),
        },
        columns: [
          ["10k+", "Happy customers"],
          ["4.9", "Average rating"],
          ["48h", "Average ship time"],
          ["24/7", "Support availability"],
        ].map(([value, label]) =>
          createDefaultColumn({
            width: { desktop: 25, tablet: 50, mobile: 100 },
            elements: [
              makeHeading(
                value,
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(6),
                },
                {
                  fontSize: { desktop: 42, tablet: 36, mobile: 30 },
                  color: "#0f172a",
                },
              ),
              makeText(
                `<p style='text-align:center;'>${label}</p>`,
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(0),
                },
                { color: "#0f766e" },
              ),
            ],
          }),
        ),
      }),
  },
  {
    id: "tabbed-info",
    name: "Tabbed Info",
    description:
      "Tab section for product details, shipping info, ingredients, or policies.",
    accent: "#7c3aed",
    keywords: ["tabs", "product tabs", "shipping tabs", "details tabs"],
    preview: {
      background:
        "linear-gradient(135deg, #faf5ff 0%, #ede9fe 46%, #ddd6fe 100%)",
      eyebrow: "Structured content",
      headline: "Organize dense content without overwhelming the page",
      supportingText: "Tabbed information section",
    },
    create: () =>
      createDefaultSection({
        name: "Tabbed Info",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#faf5ff"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "Put details in tabs, not in one long wall of copy.",
              ),
              makeTabs([
                {
                  id: "1",
                  label: "Description",
                  content:
                    "<p>Describe the product, collection, or campaign in a focused way.</p>",
                },
                {
                  id: "2",
                  label: "Shipping",
                  content:
                    "<p>Outline timelines, processing, and delivery expectations.</p>",
                },
                {
                  id: "3",
                  label: "Care",
                  content:
                    "<p>Add care instructions, materials, sizing, or warranty information.</p>",
                },
              ]),
            ],
          }),
        ],
      }),
  },
  {
    id: "contact-map",
    name: "Contact & Map",
    description:
      "A contact section that pairs form capture with a location map and social links.",
    accent: "#0f766e",
    keywords: ["contact form", "google map", "store locator", "social links"],
    preview: {
      background:
        "linear-gradient(135deg, #ecfeff 0%, #ccfbf1 46%, #99f6e4 100%)",
      eyebrow: "Contact",
      headline: "Help shoppers get in touch and find the store",
      supportingText: "Contact form and location section",
    },
    create: () =>
      createDefaultSection({
        name: "Contact & Map",
        settings: {
          ...defaultSectionSettings(),
          backgroundColor: responsiveValue("#ecfeff"),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 46, tablet: 100, mobile: 100 },
            elements: [
              makeHeading("Reach out"),
              makeText(
                "<p>Use this section for store inquiries, event RSVPs, or appointment requests.</p>",
              ),
              makeForm([
                {
                  id: "1",
                  type: "text",
                  label: "Name",
                  placeholder: "Your name",
                  required: true,
                  options: [],
                },
                {
                  id: "2",
                  type: "email",
                  label: "Email",
                  placeholder: "you@example.com",
                  required: true,
                  options: [],
                },
                {
                  id: "3",
                  type: "textarea",
                  label: "Message",
                  placeholder: "How can we help?",
                  required: true,
                  options: [],
                },
              ]),
              makeSocialIcons(
                [
                  { platform: "ig", url: "#" },
                  { platform: "fb", url: "#" },
                  { platform: "tt", url: "#" },
                ],
                {},
                { alignment: "left" },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 54, tablet: 100, mobile: 100 },
            elements: [makeMap("1600 Amphitheatre Parkway, Mountain View, CA")],
          }),
        ],
      }),
  },
  {
    id: "footer-links",
    name: "Footer Links",
    description:
      "Simple footer-style section with brand copy, quick links, and social icons.",
    accent: "#0f172a",
    keywords: ["footer", "footer menu", "payment icons", "social icons"],
    preview: {
      background:
        "linear-gradient(135deg, #020617 0%, #0f172a 45%, #334155 100%)",
      eyebrow: "Footer",
      headline: "End the page with utility links and brand presence",
      supportingText: "Footer content section",
    },
    create: () =>
      createDefaultSection({
        name: "Footer Links",
        settings: {
          ...defaultSectionSettings(),
          fullWidth: true,
          backgroundColor: responsiveValue("#020617"),
          paddingTop: responsiveValue(64),
          paddingBottom: responsiveValue(64),
          paddingLeft: responsiveValue(28),
          paddingRight: responsiveValue(28),
        },
        columns: [
          createDefaultColumn({
            width: { desktop: 40, tablet: 100, mobile: 100 },
            elements: [
              makeHeading(
                "Storefront",
                {},
                {
                  color: "#ffffff",
                  fontSize: { desktop: 30, tablet: 28, mobile: 24 },
                },
              ),
              makeText(
                "<p>Use the footer area for brand copy, support links, store hours, or a final invitation to connect.</p>",
                {},
                { color: "#cbd5e1" },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 30, tablet: 100, mobile: 100 },
            elements: [
              makeText(
                "<p style='color:#e2e8f0;font-weight:700;'>Quick links</p><p><a href='/collections/all'>Shop all</a><br><a href='/pages/about'>About</a><br><a href='/pages/contact'>Contact</a></p>",
                { marginBottom: responsiveValue(0) },
                { color: "#cbd5e1" },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 30, tablet: 100, mobile: 100 },
            elements: [
              makeSocialIcons(
                [
                  { platform: "ig", url: "#" },
                  { platform: "fb", url: "#" },
                  { platform: "yt", url: "#" },
                  { platform: "visa", url: "#" },
                ],
                {},
                { alignment: "left", iconStyle: "filled", iconColor: "#ffffff" },
              ),
            ],
          }),
        ],
      }),
  },
  {
    id: "blog-featured",
    name: "Blog Feature",
    description:
      "Editorial section for blog highlights, journal links, or content marketing callouts.",
    accent: "#475569",
    keywords: ["blog posts", "featured blog post", "article cards"],
    preview: {
      background:
        "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 46%, #cbd5e1 100%)",
      eyebrow: "Content marketing",
      headline: "Highlight articles, stories, or buying guides",
      supportingText: "Editorial and blog promo section",
    },
    create: () =>
      createDefaultSection({
        name: "Blog Feature",
        settings: {
          ...defaultSectionSettings(),
          paddingTop: responsiveValue(72),
          paddingBottom: responsiveValue(72),
        },
        columns: [
          createDefaultColumn({
            elements: [
              makeHeading(
                "Latest from the journal",
                { textAlign: responsiveValue("center") },
                { fontSize: { desktop: 42, tablet: 34, mobile: 28 } },
              ),
              makeText(
                "<p style='text-align:center;'>Use this section to drive shoppers into educational or editorial content.</p>",
                {
                  textAlign: responsiveValue("center"),
                  marginBottom: responsiveValue(24),
                },
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/900x620/e2e8f0/0f172a?text=Article+One",
                "Article one",
              ),
              makeHeading(
                "Article headline one",
                {},
                { tag: "h3", fontSize: { desktop: 26, tablet: 24, mobile: 22 } },
              ),
              makeText(
                "<p>Write a short summary or teaser for a featured article or buying guide.</p>",
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/900x620/cbd5e1/0f172a?text=Article+Two",
                "Article two",
              ),
              makeHeading(
                "Article headline two",
                {},
                { tag: "h3", fontSize: { desktop: 26, tablet: 24, mobile: 22 } },
              ),
              makeText(
                "<p>Use a second card for seasonal stories, customer education, or campaign context.</p>",
              ),
            ],
          }),
          createDefaultColumn({
            width: { desktop: 33.33, tablet: 100, mobile: 100 },
            elements: [
              makeImage(
                "https://placehold.co/900x620/94a3b8/ffffff?text=Article+Three",
                "Article three",
              ),
              makeHeading(
                "Article headline three",
                {},
                { tag: "h3", fontSize: { desktop: 26, tablet: 24, mobile: 22 } },
              ),
              makeText(
                "<p>Feature an editorial destination, press mention, or evergreen brand story.</p>",
              ),
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
