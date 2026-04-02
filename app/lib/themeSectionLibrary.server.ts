import { promises as fs } from "fs";
import path from "path";
import { db } from "./db.server";
import type { Section } from "./pageSchema";
import { buildThemeSectionLiquid } from "./themeSectionCompiler.server";
import {
  getSavedSectionFromContent,
  getSavedSectionPageContent,
  humanizeSectionHandle,
  slugifySectionHandle,
  type SavedSectionLibraryItem,
  type ThemeSectionLibraryItem,
} from "./sectionLibrary";
import { saveThemeAssetToAllThemes } from "./themeApi.server";

const SECTION_TEMPLATE_MARKER = "SECTION_TEMPLATE::";
const LOCAL_THEME_SECTION_DIR = path.join(process.cwd(), "theme-sections");

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

  const existing = await db.template.findFirst({
    where: {
      shopId,
      description: `${SECTION_TEMPLATE_MARKER}${handle}`,
    },
  });

  const content = {
    ...getSavedSectionPageContent(section, containerWidth),
    sectionTemplateMeta: {
      handle,
      assetKey,
      containerWidth,
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

  return { handle, assetKey };
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
