import { promises as fs } from "fs";
import path from "path";
import { db } from "./db.server";
import { pageContentSchema, type Section } from "./pageSchema";
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
  addSectionInstanceToActiveTheme,
  saveThemeAssetToActiveTheme,
} from "./themeApi.server";

const SECTION_TEMPLATE_MARKER = "SECTION_TEMPLATE::";
const LOCAL_THEME_SECTION_DIR = path.join(process.cwd(), "theme-sections");
const APP_BLOCK_INSTANCE_LIMIT = 50;
const NATIVE_THEME_SYNC_ENABLED =
  process.env.SHOPBUILDER_ENABLE_NATIVE_THEME_SYNC === "true";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeHandleValue(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^sections\//, "")
    .replace(/\.liquid$/i, "");
}

function getHandleCandidates(value?: string | null) {
  const normalized = normalizeHandleValue(value);
  if (!normalized) return [];

  const withoutSavedPrefix = normalized.replace(/^pb-saved-/, "");
  const slug = slugifySectionHandle(withoutSavedPrefix);
  const candidates = new Set<string>();

  [normalized, withoutSavedPrefix, slug].forEach((candidate) => {
    if (candidate) {
      candidates.add(candidate);
    }
  });

  if (withoutSavedPrefix) {
    candidates.add(`pb-saved-${withoutSavedPrefix}`);
  }

  if (slug) {
    candidates.add(`pb-saved-${slug}`);
  }

  return Array.from(candidates);
}

function getTemplateStoredHandle(template: any) {
  return (
    (template.content as any)?.sectionTemplateMeta?.handle ||
    template.description?.replace(SECTION_TEMPLATE_MARKER, "") ||
    slugifySectionHandle(template.name)
  );
}

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

function withoutBoundAppBlockInstance(content: unknown, instanceId: string) {
  const currentContent =
    content && typeof content === "object" ? { ...(content as Record<string, unknown>) } : {};
  const meta = {
    ...getTemplateMeta(content),
  };
  const nextInstances = getTemplateAppBlockInstances(content).filter(
    (value) => value !== instanceId,
  );

  return {
    ...currentContent,
    sectionTemplateMeta: {
      ...meta,
      appBlockInstances: nextInstances,
    },
  };
}

async function listSavedSectionTemplates(shopId: string) {
  return db.template.findMany({
    where: {
      shopId,
      description: {
        startsWith: SECTION_TEMPLATE_MARKER,
      },
    },
    orderBy: [{ createdAt: "desc" }],
  });
}

async function upsertSavedSectionTemplate({
  shopId,
  section,
  name,
  handle,
  containerWidth,
}: {
  shopId: string;
  section: Section;
  name: string;
  handle: string;
  containerWidth: number;
}) {
  const assetKey = `sections/${handle}.liquid`;
  const existing = await db.template.findFirst({
    where: {
      shopId,
      description: `${SECTION_TEMPLATE_MARKER}${handle}`,
    },
  });
  const appBlockInstances = getTemplateAppBlockInstances(existing?.content);
  const nextName = name.trim() || humanizeSectionHandle(handle);
  const content = {
    ...getSavedSectionPageContent(section, containerWidth),
    sectionTemplateMeta: {
      ...getTemplateMeta(existing?.content),
      handle,
      assetKey,
      containerWidth,
      appBlockInstances,
    },
  };

  if (existing) {
    const updated = await db.template.update({
      where: { id: existing.id },
      data: {
        name: nextName,
        content: content as any,
      },
    });

    return {
      templateId: updated.id,
      handle,
      assetKey,
      name: updated.name,
    };
  }

  const created = await db.template.create({
    data: {
      shopId,
      name: nextName,
      description: `${SECTION_TEMPLATE_MARKER}${handle}`,
      category: "FULL_PAGE",
      isPublic: false,
      usageCount: 0,
      content: content as any,
    },
  });

  return {
    templateId: created.id,
    handle,
    assetKey,
    name: created.name,
  };
}

async function seedSavedSectionTemplatesFromPages(shopId: string) {
  const existingTemplates = await listSavedSectionTemplates(shopId);
  if (existingTemplates.length > 0) {
    return existingTemplates;
  }

  const pages = await db.page.findMany({
    where: { shopId },
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      handle: true,
      content: true,
    },
  });

  for (const page of pages) {
    const parsed = pageContentSchema.safeParse(page.content);
    if (!parsed.success) continue;

    const containerWidth = Number(
      parsed.data.globalStyles.maxWidth || 1200,
    );

    for (const [index, section] of parsed.data.sections.entries()) {
      const pageKey =
        String(page.handle || page.title || `page-${page.id}`).trim() ||
        `page-${page.id}`;
      const baseSectionKey =
        String(section.name || `section-${index + 1}`).trim() ||
        `section-${index + 1}`;
      const duplicateCount = parsed.data.sections.filter((candidate) => {
        const candidateName =
          String(candidate.name || "").trim() || `section-${index + 1}`;
        return candidateName === baseSectionKey;
      }).length;
      const sectionKey =
        duplicateCount > 1 ? `${baseSectionKey} ${index + 1}` : baseSectionKey;
      const slug =
        slugifySectionHandle(`${pageKey}-${sectionKey}`) ||
        `section-${page.id.slice(-6)}-${index + 1}`;

      await upsertSavedSectionTemplate({
        shopId,
        section,
        name: sectionKey,
        handle: `pb-saved-${slug}`,
        containerWidth,
      });
    }
  }

  return listSavedSectionTemplates(shopId);
}

async function ensureSavedSectionTemplates(shopId: string) {
  return seedSavedSectionTemplatesFromPages(shopId);
}

function findSavedSectionTemplateByHandle(templates: any[], handle?: string | null) {
  const candidates = new Set(getHandleCandidates(handle));
  if (!candidates.size) return null;

  const exactMatch =
    templates.find((template) =>
      candidates.has(normalizeHandleValue(getTemplateStoredHandle(template))),
    ) || null;

  if (exactMatch) {
    return exactMatch;
  }

  return (
    templates.find((template) => {
      const storedHandle = normalizeHandleValue(getTemplateStoredHandle(template));
      const storedSuffix = storedHandle.replace(/^pb-saved-/, "");
      const nameSlug = normalizeHandleValue(slugifySectionHandle(template.name));

      return (
        candidates.has(storedSuffix) ||
        (nameSlug ? candidates.has(nameSlug) : false)
      );
    }) || null
  );
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
  const errors: string[] = [];

  if (!NATIVE_THEME_SYNC_ENABLED) {
    return { themeSections, errors };
  }

  for (const section of themeSections) {
    try {
      const source = await fs.readFile(
        path.join(LOCAL_THEME_SECTION_DIR, section.fileName),
        "utf8",
      );

      await saveThemeAssetToActiveTheme(
        admin,
        `sections/${section.fileName}`,
        source,
      );
    } catch (error: any) {
      errors.push(
        `Failed to sync ${section.fileName}: ${error?.message || "Unknown error"}`,
      );
    }
  }

  return { themeSections, errors };
}

export async function listSavedSections(
  shopId: string,
): Promise<SavedSectionLibraryItem[]> {
  const templates = await ensureSavedSectionTemplates(shopId);

  return templates
    .map((template) => {
      const section = getSavedSectionFromContent(template.content);
      if (!section) return null;

      return {
        id: template.id,
        handle: getTemplateStoredHandle(template),
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
  const { assetKey } = await upsertSavedSectionTemplate({
    shopId,
    section,
    name,
    handle,
    containerWidth,
  });

  const liquid = buildThemeSectionLiquid({
    section,
    displayName: name,
    containerWidth,
  });

  let syncedToTheme = false;
  let addedToHomepage = false;
  let syncError: string | null = null;

  if (NATIVE_THEME_SYNC_ENABLED) {
    try {
      await saveThemeAssetToActiveTheme(admin, assetKey, liquid);
      syncedToTheme = true;

      const homepagePlacement = await addSectionInstanceToActiveTheme(admin, {
        templateKey: "templates/index.json",
        sectionType: handle,
      });
      addedToHomepage = homepagePlacement.updated === true;
    } catch (error: any) {
      syncError =
        error?.message || "Shopify did not accept the theme section sync.";
    }
  }

  return {
    handle,
    assetKey,
    addedToHomepage,
    syncedToTheme,
    syncError,
    nativeThemeSyncEnabled: NATIVE_THEME_SYNC_ENABLED,
  };
}

export async function syncSavedSectionsToThemes(admin: any, shopId: string) {
  const templates = await ensureSavedSectionTemplates(shopId);
  const errors: string[] = [];

  if (!NATIVE_THEME_SYNC_ENABLED) {
    return { errors };
  }

  for (const template of templates) {
    const section = getSavedSectionFromContent(template.content);
    if (!section) continue;

    const handle = getTemplateStoredHandle(template);
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

    try {
      await saveThemeAssetToActiveTheme(admin, assetKey, liquid);
    } catch (error: any) {
      errors.push(
        `Failed to sync ${template.name}: ${error?.message || "Unknown error"}`,
      );
    }
  }

  return { errors };
}

export async function getLocalThemeSectionRenderPayload(handle?: string | null) {
  const candidates = new Set(getHandleCandidates(handle));
  if (!candidates.size) return null;

  const themeSections = await listLocalThemeSections();
  const match =
    themeSections.find((section) => {
      const storedHandle = normalizeHandleValue(section.handle);
      return (
        candidates.has(storedHandle) ||
        candidates.has(normalizeHandleValue(slugifySectionHandle(section.handle)))
      );
    }) || null;

  if (!match) return null;

  return {
    handle: match.handle,
    name: match.name,
    liquid: `{% section '${match.handle}' %}`,
  };
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
  const templates = await ensureSavedSectionTemplates(shop.id);
  let template = normalizedHandle
    ? findSavedSectionTemplateByHandle(templates, normalizedHandle)
    : null;

  if (!template && normalizedHandle) {
    return null;
  }

  if (!template && normalizedInstanceId) {
    template =
      templates.find((entry) =>
        getTemplateAppBlockInstances(entry.content).includes(normalizedInstanceId),
      ) || null;
  }

  if (!template) return null;

  const section = getSavedSectionFromContent(template.content);
  if (!section) return null;

  const containerWidth = Number(
    (template.content as any)?.sectionTemplateMeta?.containerWidth ||
      (template.content as any)?.globalStyles?.maxWidth ||
      1200,
  );
  const resolvedHandle = getTemplateStoredHandle(template);

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

export async function listSavedSectionsForShopDomain(shopDomain: string) {
  const shop = await db.shop.findUnique({
    where: { shopDomain },
  });

  if (!shop) return [];

  return listSavedSections(shop.id);
}

export async function bindSavedSectionAppBlockInstance({
  shopDomain,
  templateId,
  instanceId,
}: {
  shopDomain: string;
  templateId: string;
  instanceId: string;
}) {
  const shop = await db.shop.findUnique({
    where: { shopDomain },
  });

  if (!shop) {
    throw new Error("Shop not found for this block.");
  }

  const templates = await ensureSavedSectionTemplates(shop.id);
  const targetTemplate = templates.find((template) => template.id === templateId);

  if (!targetTemplate) {
    throw new Error("That saved section could not be found.");
  }

  for (const template of templates) {
    const alreadyBound = getTemplateAppBlockInstances(template.content).includes(
      instanceId,
    );
    const isTarget = template.id === targetTemplate.id;

    if (isTarget && !alreadyBound) {
      await db.template.update({
        where: { id: template.id },
        data: {
          content: withBoundAppBlockInstance(template.content, instanceId) as any,
        },
      });
    }

    if (!isTarget && alreadyBound) {
      await db.template.update({
        where: { id: template.id },
        data: {
          content: withoutBoundAppBlockInstance(template.content, instanceId) as any,
        },
      });
    }
  }

  return {
    id: targetTemplate.id,
    handle: getTemplateStoredHandle(targetTemplate),
    name: targetTemplate.name,
  };
}

export function getSavedSectionPickerMarkup({
  sections,
}: {
  sections: Array<{ id: string; name: string; handle: string }>;
}) {
  if (!sections.length) {
    return `
      <div class="shopbuilder-app-block__empty">
        Save a section in ShopBuilder, then reopen this block and choose it by name.
      </div>
    `.trim();
  }

  const options = sections
    .map(
      (section) =>
        `
          <button
            type="button"
            class="shopbuilder-app-block__picker-option"
            data-shopbuilder-template-id="${escapeHtml(section.id)}"
            data-shopbuilder-template-name="${escapeHtml(section.name)}"
          >
            <span class="shopbuilder-app-block__picker-option-name">${escapeHtml(section.name)}</span>
            <span class="shopbuilder-app-block__picker-option-meta">Saved section</span>
          </button>
        `.trim(),
    )
    .join("");

  return `
    <div class="shopbuilder-app-block__picker">
      <div class="shopbuilder-app-block__picker-title">Choose a saved section</div>
      <div class="shopbuilder-app-block__picker-text">
        Select one of your saved ShopBuilder sections and it will render here right away.
      </div>
      <div class="shopbuilder-app-block__picker-list">
        ${options}
      </div>
      <div class="shopbuilder-app-block__picker-status" data-shopbuilder-picker-status="true"></div>
    </div>
  `.trim();
}
