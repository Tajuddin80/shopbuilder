import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { authenticate } from "~/lib/shopify.server";
import { ensureShopRecord } from "~/lib/shop.server";
import { pageContentSchema } from "~/lib/pageSchema";
import {
  listLocalThemeSections,
  listSavedSections,
  saveBuilderSectionToTheme,
  syncSavedSectionsToThemes,
  syncLocalThemeSections,
} from "~/lib/themeSectionLibrary.server";

const SHOPBUILDER_APP_BLOCK_HANDLE = "shopbuilder-saved-section";

function buildThemeEditorUrl(shopDomain: string, template = "index") {
  const url = new URL(`https://${shopDomain}/admin/themes/current/editor`);
  url.searchParams.set("template", template);
  return url.toString();
}

function buildThemeAppBlockEditorUrl(shopDomain: string, template = "index") {
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  if (!apiKey) return null;

  const url = new URL(`https://${shopDomain}/admin/themes/current/editor`);
  url.searchParams.set("template", template);
  url.searchParams.set(
    "addAppBlockId",
    `${apiKey}/${SHOPBUILDER_APP_BLOCK_HANDLE}`,
  );
  url.searchParams.set("target", "newAppsSection");
  return url.toString();
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const shop = await ensureShopRecord(session);

  try {
    await syncLocalThemeSections(admin);
    await syncSavedSectionsToThemes(admin, shop.id);
  } catch (error) {
    console.error("Failed to auto-sync theme sections", error);
  }

  const [savedSections, themeSections] = await Promise.all([
    listSavedSections(shop.id),
    listLocalThemeSections(),
  ]);

  return new Response(JSON.stringify({ savedSections, themeSections }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const shop = await ensureShopRecord(session);

  const body = await request.json();
  const intent = String(body.intent || "");

  if (intent === "sync_local_theme_sections") {
    await syncLocalThemeSections(admin);
    await syncSavedSectionsToThemes(admin, shop.id);
    const themeSections = await listLocalThemeSections();
    const savedSections = await listSavedSections(shop.id);
    return new Response(JSON.stringify({ savedSections, themeSections }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (intent === "save_builder_section") {
    const pageContent = {
      version: "1.0",
      globalStyles: {
        backgroundColor: "#ffffff",
        fontFamily: "sans-serif",
        maxWidth: Number(body.containerWidth || 1200),
        customCss: "",
      },
      sections: [body.section],
    };

    const parsed = pageContentSchema.safeParse(pageContent);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid section payload" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const section = parsed.data.sections[0];
    const name = String(body.name || section.name || "Saved Section");
    const savedSection = await saveBuilderSectionToTheme({
      admin,
      shopId: shop.id,
      section,
      name,
      containerWidth: Number(body.containerWidth || 1200),
    });

    await syncSavedSectionsToThemes(admin, shop.id);

    const [savedSections, themeSections] = await Promise.all([
      listSavedSections(shop.id),
      listLocalThemeSections(),
    ]);

    return new Response(
      JSON.stringify({
        savedSections,
        themeSections,
        savedHandle: savedSection.handle,
        savedName: name,
        addedToHomepage: savedSection.addedToHomepage,
        themeEditorUrl: buildThemeEditorUrl(session.shop),
        appBlockEditorUrl: buildThemeAppBlockEditorUrl(session.shop),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (intent === "save_page_sections") {
    const sections = Array.isArray(body.sections) ? body.sections : [];

    for (const [index, rawSection] of sections.entries()) {
      const pageContent = {
        version: "1.0",
        globalStyles: {
          backgroundColor: "#ffffff",
          fontFamily: "sans-serif",
          maxWidth: Number(body.containerWidth || 1200),
          customCss: "",
        },
        sections: [rawSection],
      };

      const parsed = pageContentSchema.safeParse(pageContent);
      if (!parsed.success) continue;

      const section = parsed.data.sections[0];
      const baseName = String(section.name || `Saved Section ${index + 1}`);
      const name = `${baseName}`.trim() || `Saved Section ${index + 1}`;

      await saveBuilderSectionToTheme({
        admin,
        shopId: shop.id,
        section,
        name:
          sections.filter((candidate: any) => candidate?.name === section.name)
            .length > 1
            ? `${name} ${index + 1}`
            : name,
        containerWidth: Number(body.containerWidth || 1200),
      });
    }

    await syncLocalThemeSections(admin);
    await syncSavedSectionsToThemes(admin, shop.id);

    const [savedSections, themeSections] = await Promise.all([
      listSavedSections(shop.id),
      listLocalThemeSections(),
    ]);

    return new Response(JSON.stringify({ savedSections, themeSections }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unsupported intent" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
