export async function writeThemePage(
  admin: any,
  {
    handle,
    title,
    liquidContent,
    cssContent,
    themePageId,
  }: {
    handle: string;
    title: string;
    liquidContent: string;
    cssContent: string;
    themePageId?: string | null;
  },
) {
  const activeTheme = await getActiveTheme(admin);
  const themeId = activeTheme.id;

  await saveThemeAsset(admin, themeId, `assets/pb-page-${handle}.css`, cssContent);

  const liquidWithStyle = `<link rel="stylesheet" href="{{ 'pb-page-${handle}.css' | asset_url }}">\n${liquidContent}`;
  await saveThemeAsset(
    admin,
    themeId,
    `templates/page.pb-${handle}.liquid`,
    `{% layout 'theme' %}\n${liquidWithStyle}`,
  );

  let page;
  if (themePageId) {
    page = await admin.rest.resources.Page.find({ id: themePageId });
    page.title = title;
    page.template_suffix = `pb-${handle}`;
    await page.save({ update: true });
  } else {
    page = new admin.rest.resources.Page({ session: admin.session });
    page.title = title;
    page.handle = handle;
    page.template_suffix = `pb-${handle}`;
    page.body_html = `<!-- Managed by Shop Builder App. Edit in the app admin. -->`;
    await page.save();
  }

  return {
    pageId: String(page.id),
    previewUrl: `https://${admin.session.shop}/pages/${handle}`,
  };
}

export async function getThemeTemplates(admin: any) {
  const activeTheme = await getActiveTheme(admin);
  const assets = await admin.rest.resources.Asset.all({ theme_id: activeTheme.id });
  return assets.data.filter((a: any) => a.key.startsWith("templates/"));
}

export async function getThemes(admin: any) {
  const themeResponse = await admin.rest.resources.Theme.all();
  return themeResponse.data ?? [];
}

export async function getActiveTheme(admin: any) {
  const themeResponse = await admin.rest.resources.Theme.all({ status: "main" });
  const activeTheme = themeResponse.data[0];
  if (!activeTheme) throw new Error("No active theme found");
  return activeTheme;
}

export async function saveThemeAsset(
  admin: any,
  themeId: string | number,
  key: string,
  value: string,
) {
  await admin.rest.resources.Asset.save({
    theme_id: themeId,
    key,
    value,
  });
}

export async function saveThemeAssetToAllThemes(
  admin: any,
  key: string,
  value: string,
) {
  const themes = await getThemes(admin);

  for (const theme of themes) {
    await saveThemeAsset(admin, theme.id, key, value);
  }

  return themes;
}

export async function getThemeAsset(
  admin: any,
  themeId: string | number,
  key: string,
) {
  const response = await admin.rest.resources.Asset.all({
    theme_id: themeId,
    asset: { key },
  });

  return response.data?.[0] ?? null;
}

function getTemplateSectionInstanceId(sectionType: string) {
  const suffix = sectionType
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return `shopbuilder_${suffix || "section"}`;
}

export async function addSectionInstanceToJsonTemplate(
  admin: any,
  themeId: string | number,
  {
    templateKey,
    sectionType,
  }: {
    templateKey: string;
    sectionType: string;
  },
) {
  const templateAsset = await getThemeAsset(admin, themeId, templateKey);
  const templateSource = String(templateAsset?.value || "").trim();
  if (!templateSource) return false;

  let parsed: any;
  try {
    parsed = JSON.parse(templateSource);
  } catch (_error) {
    return false;
  }

  if (!parsed || typeof parsed !== "object") return false;
  if (!parsed.sections || typeof parsed.sections !== "object") return false;
  if (!Array.isArray(parsed.order)) return false;

  const instanceId = getTemplateSectionInstanceId(sectionType);
  const nextSections = {
    ...parsed.sections,
    [instanceId]: {
      ...(parsed.sections?.[instanceId] || {}),
      type: sectionType,
      settings: {
        ...((parsed.sections?.[instanceId] || {}).settings || {}),
      },
    },
  };

  const nextOrder = parsed.order.includes(instanceId)
    ? parsed.order
    : [...parsed.order, instanceId];

  await saveThemeAsset(
    admin,
    themeId,
    templateKey,
    JSON.stringify(
      {
        ...parsed,
        sections: nextSections,
        order: nextOrder,
      },
      null,
      2,
    ),
  );

  return true;
}

export async function addSectionInstanceToAllThemes(
  admin: any,
  {
    templateKey,
    sectionType,
  }: {
    templateKey: string;
    sectionType: string;
  },
) {
  const themes = await getThemes(admin);
  let updatedThemes = 0;

  for (const theme of themes) {
    const updated = await addSectionInstanceToJsonTemplate(admin, theme.id, {
      templateKey,
      sectionType,
    });
    if (updated) updatedThemes += 1;
  }

  return { themes, updatedThemes };
}
