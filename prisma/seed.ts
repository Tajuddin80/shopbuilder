import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function responsive<T>(v: T) {
  return { desktop: v, tablet: v, mobile: v };
}

function baseContent(name: string) {
  return {
    version: "1.0",
    globalStyles: {
      backgroundColor: "#ffffff",
      fontFamily: "sans-serif",
      maxWidth: 1200,
      customCss: "",
    },
    sections: [
      {
        id: `sec_${name}`,
        type: "section",
        name,
        visible: true,
        locked: false,
        settings: {
          backgroundColor: responsive("#ffffff"),
          backgroundImage: null,
          backgroundSize: "cover",
          backgroundPosition: "center",
          paddingTop: responsive(48),
          paddingBottom: responsive(48),
          paddingLeft: responsive(20),
          paddingRight: responsive(20),
          marginTop: responsive(0),
          marginBottom: responsive(0),
          fullWidth: false,
          minHeight: responsive(null),
          borderRadius: 0,
          borderWidth: 0,
          borderColor: "#e5e7eb",
          borderStyle: "solid",
          customCss: "",
          customId: "",
          customClass: "",
          animation: { type: "none", duration: 600, delay: 0, once: true },
        },
        columns: [
          {
            id: `col_${name}`,
            width: responsive(100),
            settings: {
              verticalAlign: "top",
              paddingTop: responsive(0),
              paddingBottom: responsive(0),
              paddingLeft: responsive(10),
              paddingRight: responsive(10),
              backgroundColor: "transparent",
            },
            elements: [
              {
                id: `el_${name}_heading`,
                type: "heading",
                name: "Heading",
                visible: true,
                locked: false,
                settings: {
                  marginTop: responsive(0),
                  marginBottom: responsive(12),
                  marginLeft: responsive(0),
                  marginRight: responsive(0),
                  paddingTop: responsive(0),
                  paddingBottom: responsive(0),
                  paddingLeft: responsive(0),
                  paddingRight: responsive(0),
                  width: responsive("100%"),
                  maxWidth: responsive("100%"),
                  textAlign: responsive("left"),
                  display: responsive("block"),
                  borderWidth: 0,
                  borderStyle: "solid",
                  borderColor: "transparent",
                  borderRadius: 0,
                  backgroundColor: "transparent",
                  opacity: 1,
                  animation: { type: "none", duration: 600, delay: 0, once: true },
                  customCss: "",
                  customId: "",
                  customClass: "",
                },
                content: {
                  text: name,
                  tag: "h2",
                  fontSize: { desktop: 32, tablet: 26, mobile: 22 },
                  fontFamily: "inherit",
                  fontWeight: "700",
                  lineHeight: 1.2,
                  letterSpacing: 0,
                  color: "#111111",
                  textTransform: "none",
                  linkUrl: "",
                  linkTarget: "_self",
                },
              },
              {
                id: `el_${name}_text`,
                type: "text",
                name: "Text",
                visible: true,
                locked: false,
                settings: {
                  marginTop: responsive(0),
                  marginBottom: responsive(0),
                  marginLeft: responsive(0),
                  marginRight: responsive(0),
                  paddingTop: responsive(0),
                  paddingBottom: responsive(0),
                  paddingLeft: responsive(0),
                  paddingRight: responsive(0),
                  width: responsive("100%"),
                  maxWidth: responsive("100%"),
                  textAlign: responsive("left"),
                  display: responsive("block"),
                  borderWidth: 0,
                  borderStyle: "solid",
                  borderColor: "transparent",
                  borderRadius: 0,
                  backgroundColor: "transparent",
                  opacity: 1,
                  animation: { type: "none", duration: 600, delay: 0, once: true },
                  customCss: "",
                  customId: "",
                  customClass: "",
                },
                content: {
                  html: "<p>Template starter content.</p>",
                  fontSize: { desktop: 16, tablet: 16, mobile: 15 },
                  fontFamily: "inherit",
                  lineHeight: 1.6,
                  color: "#444444",
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

async function main() {
  const templates = [
    { name: "Landing Page — Classic", category: "FULL_PAGE" },
    { name: "Landing Page — Minimal", category: "FULL_PAGE" },
    { name: "Hero — Centered", category: "HERO" },
    { name: "Hero — Left aligned", category: "HERO" },
    { name: "Hero — Split", category: "HERO" },
    { name: "Features — Icons 3-col", category: "FEATURES" },
    { name: "Features — Cards 3-col", category: "FEATURES" },
    { name: "Testimonials — Grid", category: "TESTIMONIALS" },
    { name: "Pricing — 3 tiers", category: "PRICING" },
    { name: "FAQ — Accordion", category: "FAQ" },
    { name: "Product Showcase — Grid", category: "PRODUCT_SHOWCASE" },
    { name: "Collection Grid", category: "COLLECTION_GRID" },
    { name: "Contact — Form + Map", category: "CONTACT" },
    { name: "Coming Soon — Countdown", category: "LANDING_PAGE" },
    { name: "Blog — Featured + Grid", category: "BLOG" },
  ] as const;

  for (const t of templates) {
    await prisma.template.upsert({
      where: { id: `seed_${t.category}_${t.name.replace(/\W+/g, "_")}` },
      update: {
        name: t.name,
        category: t.category as any,
        isPublic: true,
        content: baseContent(t.name) as any,
      },
      create: {
        id: `seed_${t.category}_${t.name.replace(/\W+/g, "_")}`,
        name: t.name,
        description: "Seed template",
        category: t.category as any,
        isPublic: true,
        usageCount: 0,
        content: baseContent(t.name) as any,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

