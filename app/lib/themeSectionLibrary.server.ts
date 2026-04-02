import { promises as fs } from "fs";
import path from "path";
import { db } from "./db.server";
import type { Section } from "./pageSchema";
import {
  buildThemeAppProxyLiquid,
  buildThemeSectionLiquid,
} from "./themeSectionCompiler.server";
import {
  getSavedSectionFromContent,
  getSavedSectionPageContent,
  humanizeSectionHandle,
  slugifySectionHandle,
  type SavedSectionLibraryItem,
  type ThemeSectionLibraryItem,
} from "./sectionLibrary";
import {
  addSectionInstanceToAllThemes,
  saveThemeAssetToAllThemes,
} from "./themeApi.server";

const SECTION_TEMPLATE_MARKER = "SECTION_TEMPLATE::";
const LOCAL_THEME_SECTION_DIR = path.join(process.cwd(), "theme-sections");
const APP_BLOCK_INSTANCE_LIMIT = 50;

function getTemplateMeta(content: unknown) {
  return ((content as any)?.sectionTemplateMeta || {}) as Record<string, any>;
}

function getTemplateAppBlockInstances(content: unknown) {
  const instances = getTemplateMeta(content).appBlockInstances;
  if (!Array.isArray(instances)) return [];

  return instances
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .slice(0, APP_BLOCK_INSTANCE_LIMIT);
}

function withBoundAppBlockInstance(content: unknown, instanceId: string) {
  const currentContent =
    content && typeof content === "object" ? { ...(content as Record<string, unknown>) } : {};
  const meta = {
    ...getTemplateMeta(content),
  };
  const nextInstances = Array.from(
    new Set([...getTemplateAppBlockInstances(content), instanceId]),
  ).slice(-APP_BLOCK_INSTANCE_LIMIT);

  return {
    ...currentContent,
    sectionTemplateMeta: {
      ...meta,
      appBlockInstances: nextInstances,
    },
  };
}

export async function listLocalThemeSections(): Promise<
  ThemeSectionLibraryItem[]
> {
  try {
    const entries = await fs.readdir(LOCAL_THEME_SECTION_DIR, {
      withFileTypes: true,
    });

    return entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".liquid"))
      .map((entry) => {
        const handle = entry.name.replace(/\.liquid$/i, "");
        return {
          handle,
          fileName: entry.name,
          name: humanizeSectionHandle(handle),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (error: any) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

export async function syncLocalThemeSections(admin: any) {
  const themeSections = await listLocalThemeSections();

  for (const section of themeSections) {
    const source = await fs.readFile(
      path.join(LOCAL_THEME_SECTION_DIR, section.fileName),
      "utf8",
    );

    await saveThemeAssetToAllThemes(admin, `sections/${section.fileName}`, source);
  }

  return themeSections;
}

export async function listSavedSections(
  shopId: string,
): Promise<SavedSectionLibraryItem[]> {
  const templates = await db.template.findMany({
    where: {
      shopId,
      description: {
        startsWith: SECTION_TEMPLATE_MARKER,
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });

  return templates
    .map((template) => {
      const section = getSavedSectionFromContent(template.content);
      if (!section) return null;

      const handle =
        (template.content as any)?.sectionTemplateMeta?.handle ||
        template.description?.replace(SECTION_TEMPLATE_MARKER, "") ||
        slugifySectionHandle(template.name);

      return {
        id: template.id,
        handle,
        name: template.name,
        section,
      };
    })
    .filter(Boolean) as SavedSectionLibraryItem[];
}

export async function saveBuilderSectionToTheme({
  admin,
  shopId,
  section,
  name,
  containerWidth,
}: {
  admin: any;
  shopId: string;
  section: Section;
  name: string;
  containerWidth: number;
}) {
  const slug = slugifySectionHandle(name) || `section-${Date.now()}`;
  const handle = `pb-saved-${slug}`;
  const assetKey = `sections/${handle}.liquid`;

  const liquid = buildThemeSectionLiquid({
    section,
    displayName: name,
    containerWidth,
  });

  await saveThemeAssetToAllThemes(admin, assetKey, liquid);
  const homepagePlacement = await addSectionInstanceToAllThemes(admin, {
    templateKey: "templates/index.json",
    sectionType: handle,
  });

  const existing = await db.template.findFirst({
    where: {
      shopId,
      description: `${SECTION_TEMPLATE_MARKER}${handle}`,
    },
  });
  const appBlockInstances = getTemplateAppBlockInstances(existing?.content);

  const content = {
    ...getSavedSectionPageContent(section, containerWidth),
    sectionTemplateMeta: {
      handle,
      assetKey,
      containerWidth,
      appBlockInstances,
    },
  };

  if (existing) {
    await db.template.update({
      where: { id: existing.id },
      data: {
        name,
        content: content as any,
      },
    });
  } else {
    await db.template.create({
      data: {
        shopId,
        name,
        description: `${SECTION_TEMPLATE_MARKER}${handle}`,
        category: "FULL_PAGE",
        isPublic: false,
        usageCount: 0,
        content: content as any,
      },
    });
  }

  return {
    handle,
    assetKey,
    addedToHomepage: homepagePlacement.updatedThemes > 0,
  };
}

export async function syncSavedSectionsToThemes(admin: any, shopId: string) {
  const templates = await db.template.findMany({
    where: {
      shopId,
      description: {
        startsWith: SECTION_TEMPLATE_MARKER,
      },
    },
  });

  for (const template of templates) {
    const section = getSavedSectionFromContent(template.content);
    if (!section) continue;

    const handle =
      (template.content as any)?.sectionTemplateMeta?.handle ||
      template.description?.replace(SECTION_TEMPLATE_MARKER, "") ||
      slugifySectionHandle(template.name);
    const assetKey =
      (template.content as any)?.sectionTemplateMeta?.assetKey ||
      `sections/${handle}.liquid`;
    const containerWidth = Number(
      (template.content as any)?.sectionTemplateMeta?.containerWidth ||
        (template.content as any)?.globalStyles?.maxWidth ||
        1200,
    );

    const liquid = buildThemeSectionLiquid({
      section,
      displayName: template.name,
      containerWidth,
    });

    await saveThemeAssetToAllThemes(admin, assetKey, liquid);
  }
}

export async function getSavedSectionRenderPayload({
  shopDomain,
  handle,
  instanceId,
}: {
  shopDomain: string;
  handle?: string | null;
  instanceId?: string | null;
}) {
  const shop = await db.shop.findUnique({
    where: { shopDomain },
  });

  if (!shop) return null;

  const normalizedHandle = String(handle || "").trim();
  const normalizedInstanceId = String(instanceId || "").trim();
  let template = normalizedHandle
    ? await db.template.findFirst({
        where: {
          shopId: shop.id,
          description: `${SECTION_TEMPLATE_MARKER}${normalizedHandle}`,
        },
      })
    : null;

  if (!template) {
    const templates = await db.template.findMany({
      where: {
        shopId: shop.id,
        description: {
          startsWith: SECTION_TEMPLATE_MARKER,
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    if (normalizedInstanceId) {
      template =
        templates.find((entry) =>
          getTemplateAppBlockInstances(entry.content).includes(normalizedInstanceId),
        ) || null;
    }

    template =
      template ||
      templates.find((entry) => Boolean(getSavedSectionFromContent(entry.content))) ||
      null;

    if (template && normalizedInstanceId) {
      const boundContent = withBoundAppBlockInstance(
        template.content,
        normalizedInstanceId,
      );

      if (
        getTemplateAppBlockInstances(template.content).join("|") !==
        getTemplateAppBlockInstances(boundContent).join("|")
      ) {
        template = await db.template.update({
          where: { id: template.id },
          data: {
            content: boundContent as any,
          },
        });
      }
    }
  }

  if (!template) return null;

  if (
    template &&
    normalizedInstanceId &&
    !getTemplateAppBlockInstances(template.content).includes(normalizedInstanceId)
  ) {
    template = await db.template.update({
      where: { id: template.id },
      data: {
        content: withBoundAppBlockInstance(
          template.content,
          normalizedInstanceId,
        ) as any,
      },
    });
  }

  const section = getSavedSectionFromContent(template.content);
  if (!section) return null;

  const containerWidth = Number(
    (template.content as any)?.sectionTemplateMeta?.containerWidth ||
      (template.content as any)?.globalStyles?.maxWidth ||
      1200,
  );
  const resolvedHandle =
    (template.content as any)?.sectionTemplateMeta?.handle ||
    template.description?.replace(SECTION_TEMPLATE_MARKER, "") ||
    slugifySectionHandle(template.name);

  return {
    handle: resolvedHandle,
    name: template.name,
    liquid: buildThemeAppProxyLiquid({
      section,
      displayName: template.name,
      containerWidth,
      instanceId: instanceId || resolvedHandle,
    }),
  };
}
