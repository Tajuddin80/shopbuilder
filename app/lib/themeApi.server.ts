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
  const themeResponse = await admin.rest.resources.Theme.all({ status: "main" });
  const activeTheme = themeResponse.data[0];
  if (!activeTheme) throw new Error("No active theme found");
  const themeId = activeTheme.id;

  await admin.rest.resources.Asset.save({
    theme_id: themeId,
    key: `assets/pb-page-${handle}.css`,
    value: cssContent,
  });

  const liquidWithStyle = `<link rel="stylesheet" href="{{ 'pb-page-${handle}.css' | asset_url }}">\n${liquidContent}`;
  await admin.rest.resources.Asset.save({
    theme_id: themeId,
    key: `templates/page.pb-${handle}.liquid`,
    value: `{% layout 'theme' %}\n${liquidWithStyle}`,
  });

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
    page.body_html = `<!-- Managed by PageBuilder App. Edit in the app admin. -->`;
    await page.save();
  }

  return {
    pageId: String(page.id),
    previewUrl: `https://${admin.session.shop}/pages/${handle}`,
  };
}

export async function getThemeTemplates(admin: any) {
  const themeResponse = await admin.rest.resources.Theme.all({ status: "main" });
  const activeTheme = themeResponse.data[0];
  const assets = await admin.rest.resources.Asset.all({ theme_id: activeTheme.id });
  return assets.data.filter((a: any) => a.key.startsWith("templates/"));
}

